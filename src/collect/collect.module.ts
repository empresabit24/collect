import { Module } from '@nestjs/common';
import { CollectService } from './usecases/collect.service';
import { CollectController } from './collect.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraestructureModule } from '../infraestructure/infraestructure.module';
import { collect } from './entities/collect.entity';
import { receivable } from './entities/receivable.entity';
import { ActualizarEstadoService } from './usecases/actualizar-estado.service';
import { CollectionReportService } from './usecases/collection-report.service';
import { receivableState } from './entities/receivable-state.entity';
import { WeeklyReceivablesService } from './usecases/weekly-receivables.service';

@Module({
  controllers: [CollectController],
  imports: [
    TypeOrmModule.forFeature([collect, receivable, receivableState]),
    InfraestructureModule,
  ],
  providers: [
    CollectService,
    ActualizarEstadoService,
    CollectionReportService,
    WeeklyReceivablesService,
  ],
  exports: [TypeOrmModule],
})
export class CollectModule {}
