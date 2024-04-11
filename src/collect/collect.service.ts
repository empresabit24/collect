import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCollectDto } from './dto/create-collect.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { collect } from './entities/collect.entity';
import { Repository } from 'typeorm';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { receivable } from './entities/receivable.entity';

@Injectable()
export class CollectService {
  constructor(
    @InjectRepository(receivable)
    private readonly receivableRepository: Repository<receivable>,

    @InjectRepository(collect)
    private readonly collectRepository: Repository<collect>,
  ) {}
  async createCollect(createCollectDto: CreateCollectDto) {
    try {
      await this.collectRepository.save(createCollectDto);

      return {
        success: true,
        message: `El cobro de S/ ${createCollectDto.amount} se registró con éxito `,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `No se pudo registrar el cobro. ${error}`,
      );
    }
  }

  async createReceivable(createReceivableDto: CreateReceivableDto) {
    try {
      await this.receivableRepository.save(createReceivableDto);
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

  async findAll() {
    return await this.collectRepository.createQueryBuilder('collect').getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} collect`;
  }
}
