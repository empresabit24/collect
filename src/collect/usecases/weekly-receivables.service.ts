import { BadRequestException, Injectable } from '@nestjs/common';

// Importación de librería moment en español
import * as moment from 'moment';
import 'moment/locale/es';
import { InjectRepository } from '@nestjs/typeorm';
import { receivable } from '../entities/receivable.entity';
import { Repository } from 'typeorm';
import { FindReceivablesByDateDto } from '../dto/find-receivables-by-date.dto';

@Injectable()
export class WeeklyReceivablesService {
  constructor(
    @InjectRepository(receivable)
    private readonly receivableRepository: Repository<receivable>,
  ) {}

  async findReceivablesOfTheWeek() {
    const today = moment().utcOffset(-5);
    const oneWeekLater = today.clone().add(7, 'days');

    // se obtienen todos los receivables de los clientes
    const receivables = await this.receivableRepository
      .createQueryBuilder('receivable')
      .leftJoinAndSelect('receivable.infoCliente', 'cliente')
      .leftJoinAndSelect('cliente.infoPersona', 'persona')
      .select(['receivable', 'cliente.idcliente', 'persona'])
      .where('receivable.payday_limit BETWEEN :today AND :oneWeekLater', {
        today: today.toDate(),
        oneWeekLater: oneWeekLater.toDate(),
      })
      .orderBy('receivable.payday_limit', 'ASC')
      .getMany();

    // Se agrupan los receivables por día
    return this.groupReceivablesByDate(receivables);
  }

  async findOverdueReceivables() {
    // se obtienen todos los receivables de los clientes
    const receivables = await this.receivableRepository
      .createQueryBuilder('receivable')
      .leftJoinAndSelect('receivable.infoCliente', 'cliente')
      .leftJoinAndSelect('cliente.infoPersona', 'persona')
      .select(['receivable', 'cliente.idcliente', 'persona'])
      .where('receivable.state = :state', { state: 5 })
      .orderBy('receivable.payday_limit', 'ASC')
      .getMany();

    // Se agrupan los receivables por día
    return this.groupReceivablesByDate(receivables);
  }

  async findReceivablesByDate(
    findReceivablesByDateDto: FindReceivablesByDateDto,
  ) {
    const { initialDate, endDate } = findReceivablesByDateDto;

    console.log(initialDate, endDate);

    // validar que initialDate sea menor que endDate
    if (initialDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial debe ser menor que la fecha final',
      );
    }

    // se obtienen todos los receivables de los clientes
    const receivables = await this.receivableRepository
      .createQueryBuilder('receivable')
      .leftJoinAndSelect('receivable.infoCliente', 'cliente')
      .leftJoinAndSelect('cliente.infoPersona', 'persona')
      .select(['receivable', 'cliente.idcliente', 'persona'])
      .where(
        'receivable.payday_limit >= :initialDate AND receivable.payday_limit <= :endDate',
        {
          initialDate: initialDate,
          endDate: endDate,
        },
      )
      .orderBy('receivable.payday_limit', 'ASC')
      .getMany();

    // Se agrupan los receivables por día
    return this.groupReceivablesByDate(receivables);
  }

  groupReceivablesByDate(receivables: any[]) {
    const groupedReceivables = {};
    const days = [];

    receivables.forEach((receivable) => {
      const dateKey = moment(receivable.payday_limit).format(
        'dddd DD [de] MMMM YYYY',
      );
      if (!groupedReceivables[dateKey]) {
        groupedReceivables[dateKey] = [];
        days.push(dateKey); // Guardar la fecha solo si es una nueva clave
      }
      groupedReceivables[dateKey].push(receivable); //Guardar el receivable
    });

    return {
      days,
      receivables: days.map((date) => groupedReceivables[date]),
    };
  }
}
