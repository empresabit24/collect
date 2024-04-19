import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { receivable } from '../entities/receivable.entity';
import { Between, Repository } from 'typeorm';
import { differenceInDays } from 'date-fns';

@Injectable()
export class ActualizarEstadoService {
  private readonly logger = new Logger('CollectService');
  constructor(
    @InjectRepository(receivable)
    private readonly receivableRepository: Repository<receivable>,
  ) {}

  async updateReceivablesState() {
    try {
      this.logger.log('Iniciando la actualización de estados...');
      const receivables = await this.receivableRepository.find({
        where: { state: Between(2, 4) },
      });

      const today = new Date();
      for (const receivable of receivables) {
        switch (receivable.state) {
          case 2:
            if (differenceInDays(receivable.payday_limit, today) <= 7) {
              receivable.state = 3; // Cambia estado a 'por vencer'
            }
            break;
          case 3:
            if (differenceInDays(receivable.payday_limit, today) >= 1) {
              receivable.state = 4; // Cambia estado a 'en fecha'
            }
            break;
          case 4:
            if (today > receivable.payday_limit) {
              receivable.state = 5; // Cambia estado a 'vencido'
            }
            break;
        }
        await this.receivableRepository.save(receivable);
      }
      console.log('Actualización de estados completada.');
    } catch (error) {
      console.error('Error al actualizar los estados:', error);
    }
  }
}
