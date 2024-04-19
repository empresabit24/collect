import { Module } from '@nestjs/common';
import { CollectService } from './usecases/collect.service';
import { CollectController } from './collect.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraestructureModule } from '../infraestructure/infraestructure.module';
import { collect } from './entities/collect.entity';
import { receivable } from './entities/receivable.entity';
import { ActualizarEstadoService } from './usecases/actualizar-estado.service';

@Module({
  controllers: [CollectController],
  imports: [
    TypeOrmModule.forFeature([collect, receivable]),
    InfraestructureModule,
  ],
  providers: [CollectService, ActualizarEstadoService],
  exports: [TypeOrmModule],
})
export class CollectModule {}
