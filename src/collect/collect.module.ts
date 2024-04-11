import {Logger, Module} from '@nestjs/common';
import { CollectService } from './collect.service';
import { CollectController } from './collect.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraestructureModule } from '../infraestructure/infraestructure.module';
import { collect } from './entities/collect.entity';
import { receivable } from './entities/receivable.entity';

@Module({
  controllers: [CollectController],
  providers: [CollectService],
  imports: [
    TypeOrmModule.forFeature([collect, receivable]),
    InfraestructureModule,
  ],
})


export class CollectModule {
  private readonly logger = new Logger(CollectModule.name);

  constructor() {
    this.logger.log('CollectModule initialized');
  }
}
