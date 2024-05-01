import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as dateFns from 'date-fns';

import { collect } from '../entities/collect.entity';
import { receivable } from '../entities/receivable.entity';
import { clientes } from '../../infraestructure/entities';
import { CreateCollectDto } from '../dto/create-collect.dto';
import { CreateReceivableDto } from '../dto/create-receivable.dto';
import { UpdatePaydayLimitDto } from '../dto/update-payday-limit.dto';

@Injectable()
export class CollectService {
  private readonly logger = new Logger('CollectService');
  constructor(
    @InjectRepository(receivable)
    private readonly receivableRepository: Repository<receivable>,

    @InjectRepository(clientes)
    private readonly clienteRepository: Repository<clientes>,

    @InjectRepository(collect)
    private readonly collectRepository: Repository<collect>,
  ) {}
  async createCollect(createCollectDto: CreateCollectDto) {
    // VALIDAR SI VIENE EL id_receivable
    if (createCollectDto.id_receivable) {
      this.logger.log('Se envío un ID_RECEIVABLE');
      const receivable = await this.receivableRepository
        .createQueryBuilder('receivable')
        .select([
          'receivable.pending_amount',
          'receivable.description',
          'receivable.state',
        ])
        .where('receivable.id_receivable = :id_receivable', {
          id_receivable: createCollectDto.id_receivable,
        })
        .getOne();

      // validar si existe el id_receivable
      if (!receivable) {
        throw new InternalServerErrorException(
          `No se encontró la cuenta por pagar con id ${createCollectDto.id_receivable}`,
        );
      }

      const { pending_amount, description, state } = receivable;
      this.logger.log(
        `Sí existe el ID_RECEIVABLE ${description} - ${pending_amount}`,
      );

      // verificar si la cuenta por cobrar ya está pagada
      if (Number(state) === 1) {
        throw new BadRequestException(
          `Esta cuenta (${description}) ya está pagada totalmente.`,
        );
      }

      // validar si hay un monto pendiente
      if (pending_amount < createCollectDto.amount) {
        throw new BadRequestException(
          `El monto a pagar ( S/ ${createCollectDto.amount} ) excede el monto pendiente (S/ ${pending_amount} ) en esta cuenta por cobrar '${description}'.`,
        );
      } else {
        // crear el nuevo cobro
        const nuevoCobro = this.collectRepository.create(createCollectDto);
        await this.collectRepository.save(nuevoCobro);

        this.logger.log('Se creó el nuevo cobro.');

        // actualizar el monto pendiente en la cuenta por cobrar

        await this.receivableRepository.update(
          { id_receivable: Number(createCollectDto.id_receivable) },
          {
            pending_amount: pending_amount - Number(createCollectDto.amount),
          },
        );
        this.logger.log(
          'Se actualizó el monto pendiente en la cuenta por cobrar.',
        );

        // si el monto pagado es igual al monto pendiente, actualizar estado de cuenta por cobrar
        if (Number(pending_amount) === Number(createCollectDto.amount)) {
          await this.receivableRepository.update(
            { id_receivable: Number(createCollectDto.id_receivable) },
            {
              state: 1,
            },
          );
          this.logger.log('Se actualizó el estado de la cuenta por cobrar.');
        }

        return {
          success: true,
          message: `El cobro de S/ ${createCollectDto.amount} se registró con éxito `,
        };
      }
    } else if (!createCollectDto.id_receivable) {
      // VALIDAR SI NO viene el id_receivable
      this.logger.log('NO se envío un ID_RECEIVABLE');

      // validar que se reciba el idcliente
      if (!createCollectDto.idcliente) {
        throw new BadRequestException(
          'Si no se envía el id_receivable, debe enviarse el idcliente',
        );
      }

      // se buscan todos los receivables del cliente que no estén como pagados
      const receivables = await this.receivableRepository
        .createQueryBuilder('receivable')
        .select([
          'receivable.id_receivable',
          'receivable.description',
          'receivable.pending_amount',
          'receivable.payday_limit',
          'receivable.state',
        ])
        .where('receivable.idcliente = :idcliente', {
          idcliente: createCollectDto.idcliente,
        })
        .andWhere('receivable.state <> :state', { state: 1 })
        .orderBy('receivable.payday_limit', 'ASC')
        .getMany();

      console.log(receivables);

      // se valida que el cliente tenga deudas(receivables) pendientes
      if (receivables.length === 0) {
        throw new BadRequestException(
          `El cliente con id ${createCollectDto.idcliente} no tiene deudas pendientes.`,
        );
      }

      // se valida que el monto a pagar no supere el total de las deudas pendientes
      const totalPendingAmount = receivables.reduce((sum, receivable) => {
        return sum + Number(receivable.pending_amount);
      }, 0);

      if (totalPendingAmount < createCollectDto.amount) {
        throw new BadRequestException(
          `La deuda total del usuario es de S/ ${totalPendingAmount}`,
        );
      }

      let remainingAmount: number = Number(createCollectDto.amount);

      for (const receivable of receivables) {
        if (remainingAmount <= 0) {
          break; // Si no queda saldo por pagar, sal del bucle
        }

        const pendingAmount = Number(receivable.pending_amount);
        let collectAmount: number;

        if (pendingAmount <= remainingAmount) {
          // Si el monto pendiente es menor o igual al saldo restante
          // Se paga completamente este receivable
          collectAmount = pendingAmount;
          remainingAmount -= pendingAmount;
          receivable.pending_amount = 0; // Actualiza el pending_amount a 0
          receivable.state = 1; // Cambia el estado a 1
        } else {
          // Si el monto pendiente es mayor al saldo restante
          // Se paga parcialmente este receivable
          collectAmount = remainingAmount;
          receivable.pending_amount =
            Number(pendingAmount) - Number(remainingAmount); // Resta el saldo restante del monto pendiente
          remainingAmount = 0; // El saldo restante se vuelve 0
        }

        // Crea un nuevo collect con los datos correspondientes
        const newCollect = new CreateCollectDto();
        newCollect.id_receivable = receivable.id_receivable;
        newCollect.idformapago = createCollectDto.idformapago;
        newCollect.amount = collectAmount;
        newCollect.payment_date = createCollectDto.payment_date;

        // Guarda el nuevo collect en la base de datos
        await this.collectRepository.save(newCollect);
        this.logger.log(`Se registró el cobro de ${newCollect.amount}`);
      }

      // Guarda los cambios en la base de datos
      await Promise.all(
        receivables.map((receivable) =>
          this.receivableRepository.save(receivable),
        ),
      );

      this.logger.log(
        `El cobro de S/ ${createCollectDto.amount} se registró con éxito.`,
      );
      return {
        success: true,
        message: `El cobro de S/ ${createCollectDto.amount} se registró con éxito.`,
      };
    }
  }

  async createReceivable(createReceivableDto: CreateReceivableDto) {
    try {
      const nuevaCuentaPorCobrar =
        this.receivableRepository.create(createReceivableDto);

      await this.receivableRepository.save(nuevaCuentaPorCobrar);
      return {
        success: true,
        message: `La cuenta por cobrar de S/ ${createReceivableDto.total_amount} se registró con éxito `,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `No se pudo registrar la cuenta por cobrar. ${error}`,
      );
    }
  }

  async findAllReceivablesForAllClients(): Promise<any[]> {
    try {
      this.logger.log('Buscando clientes con receivables...');
      const clientsWithReceivables = await this.clienteRepository
        .createQueryBuilder('cliente')
        .select([
          'cliente.idcliente',
          'cliente.codigodirecto',
          'cliente.idpersona',
          'cliente.idestado',
          'persona.idpersona',
          'persona.nombres',
          'persona.apellidopaterno',
          'persona.apellidomaterno',
          'persona.razonsocial',
        ])
        .leftJoin('cliente.infoPersona', 'persona')
        .leftJoin('cliente.receivables', 'receivables')
        .where('receivables.idcliente IS NOT NULL') // Asegurarse de considerar solo clientes con cuentas por cobrar
        .groupBy('cliente.idcliente')
        .addGroupBy('persona.idpersona')
        .addSelect('SUM(receivables.total_amount)', 'total_amount')
        .addSelect('SUM(receivables.pending_amount)', 'pending_amount')
        .addSelect('MAX(receivables.state)', 'state')
        .getRawMany();

      if (!clientsWithReceivables.length) {
        throw new NotFoundException(
          'No se encontraron clientes con cuentas por cobrar.',
        );
      }

      const clientsWithCriticalReceivable = [];
      for (const client of clientsWithReceivables) {
        const { state } = client;
        const criticalReceivable = await this.receivableRepository
          .createQueryBuilder('receivables')
          .select('MIN(receivables.payday_limit)', 'critical_payday_limit')
          .where('receivables.state = :state', { state })
          .getRawOne();

        clientsWithCriticalReceivable.push({
          ...client,
          critical_payday_limit: criticalReceivable.critical_payday_limit,
        });
      }

      this.logger.log('Búsqueda de clientes con receivables completada');

      return clientsWithCriticalReceivable.map((client) => ({
        idcliente: parseInt(client.cliente_idcliente),
        codigodirecto: client.cliente_codigodirecto,
        idpersona: client.cliente_idpersona,
        idestado: client.cliente_idestado,
        infoPersona: {
          idpersona: client.persona_idpersona,
          nombres: client.persona_nombres,
          apellidopaterno: client.persona_apellidopaterno,
          apellidomaterno: client.persona_apellidomaterno,
          razonsocial: client.persona_razonsocial,
        },
        infoReceivables: {
          total_amount: parseFloat(client.total_amount),
          pending_amount: parseFloat(client.pending_amount),
          state: client.state,
          critical_payday_limit: client.critical_payday_limit,
        },
      }));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al buscar los datos de los clientes',
      );
    }
  }

  async findAllReceivablesByClient(idCliente: number) {
    try {
      return await this.receivableRepository
        .createQueryBuilder('receivable')
        .where('receivable.idcliente = :idcliente', { idcliente: idCliente })
        .orderBy('receivable.payday_limit', 'ASC')
        .getMany();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `Hubo un error al buscar los datos de las cuentas por cobrar. ${error}`,
      );
    }
  }

  async findOneReceivable(idReceivable: number) {
    try {
      return await this.receivableRepository
        .createQueryBuilder('receivable')
        .leftJoinAndSelect('receivable.collects', 'collect')
        .where('receivable.id_receivable = :id_receivable', {
          id_receivable: idReceivable,
        })
        .orderBy('collect.payment_date', 'DESC')
        .getOne();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `Hubo un error al buscar la cuenta por cobrar. ${error}`,
      );
    }
  }

  async updatePaydayLimit(updatePaydayLimitDto: UpdatePaydayLimitDto) {
    // se busca la cuenta por cobrar
    const receivable = await this.receivableRepository
      .createQueryBuilder('receivable')
      .where('receivable.id_receivable = :id_receivable', {
        id_receivable: updatePaydayLimitDto.id_receivable,
      })
      .getOne();

    // validamos que esta cuenta por cobrar exista
    if (!receivable) {
      throw new BadRequestException(
        `No se encontró la cuenta por cobrar con id ${updatePaydayLimitDto.id_receivable}`,
      );
    }
    // actualización del payday_limit para dentro de una semana
    if (updatePaydayLimitDto.oneWeekLater) {
      this.logger.log('Actualización de fecha una semana después.');
      try {
        // Obtener el payday_limit actual
        const currentPaydayLimit = receivable.payday_limit;

        // Mover la fecha 7 días después
        const newPaydayLimit = dateFns.addDays(currentPaydayLimit, 7);

        // Actualizar el registro con la nueva fecha de límite de pago
        await this.receivableRepository.update(
          { id_receivable: updatePaydayLimitDto.id_receivable },
          { payday_limit: newPaydayLimit },
        );
        this.logger.log(
          'Se actualizó la cuenta por cobrar para dentro de una semana',
        );

        return {
          success: true,
          message: `La fecha de pago de la cuenta '${receivable.description}' se movió para ${dateFns.format(newPaydayLimit, 'dd/MM/yyyy')}`,
        };
      } catch (error) {
        throw new InternalServerErrorException(
          `Hubo un error, por favor revisar los logs`,
        );
      }
    }
    // Si se actualiza el receivable para una fecha personalizada
    if (!updatePaydayLimitDto.oneWeekLater) {
      this.logger.log(
        'Actualización de fecha personalizada de una cuenta por cobrar.',
      );
      try {
        this.receivableRepository.update(
          { id_receivable: updatePaydayLimitDto.id_receivable },
          { payday_limit: updatePaydayLimitDto.new_payday_limit },
        );
        this.logger.log('Actualización de fecha personalizada completada.');

        return {
          success: true,
          message: `Se reagendó la fecha de la cuenta '${receivable.description}' a ${dateFns.format(updatePaydayLimitDto.new_payday_limit, 'dd/MM/yyyy')}`,
        };
      } catch (error) {
        this.logger.error(error);
      }
    }
  }
}
