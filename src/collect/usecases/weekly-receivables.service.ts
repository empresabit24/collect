import { Injectable } from '@nestjs/common';

// Importación de librería moment en español
import * as moment from 'moment';
import 'moment/locale/es';
import { InjectRepository } from '@nestjs/typeorm';
import { receivable } from '../entities/receivable.entity';
import { Repository } from 'typeorm';

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

    // Objeto para mantener agrupados los receivables
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

    // Mapear cada fecha a su grupo de receivables
    return {
      days,
      receivables: days.map((date) => groupedReceivables[date]),
    };
  }

  async findOverdueReceivables() {
    const today = moment().utcOffset(-5);
    const oneWeekLater = today.clone().add(7, 'days');

    // se obtienen todos los receivables de los clientes
    const receivables = await this.receivableRepository
      .createQueryBuilder('receivable')
      .leftJoinAndSelect('receivable.infoCliente', 'cliente')
      .leftJoinAndSelect('cliente.infoPersona', 'persona')
      .select(['receivable', 'cliente.idcliente', 'persona'])
      .where('receivable.state = :state', { state: 5 })
      .orderBy('receivable.payday_limit', 'ASC')
      .getMany();

    // Objeto para mantener agrupados los receivables
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

    // Mapear cada fecha a su grupo de receivables
    return {
      days,
      receivables: days.map((date) => groupedReceivables[date]),
    };
  }
}
