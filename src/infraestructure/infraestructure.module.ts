import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from './entities';

@Module({
  imports: [TypeOrmModule.forFeature(Object.values(entities))],
  exports: [TypeOrmModule],
  controllers: [],
  providers: [],
})
export class InfraestructureModule {}
