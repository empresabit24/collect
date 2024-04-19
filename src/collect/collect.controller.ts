import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CollectService } from './usecases/collect.service';
import { CreateCollectDto } from './dto/create-collect.dto';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { ActualizarEstadoService } from './usecases/actualizar-estado.service';

@Controller('collect')
export class CollectController {
  constructor(
    private readonly collectService: CollectService,
    private readonly updateStateService: ActualizarEstadoService,
  ) {}

  @Post('createReceivable')
  createReceivable(@Body() createReceivableDto: CreateReceivableDto) {
    return this.collectService.createReceivable(createReceivableDto);
  }
  @Post('createCollect')
  createCollect(@Body() createCollectDto: CreateCollectDto) {
    return this.collectService.createCollect(createCollectDto);
  }

  @Get('allClients')
  findClientReceivables() {
    return this.collectService.findAllReceivablesForAllClients();
  }

  @Get('client/:idClient')
  findAllReceivablesByClient(@Param('idClient') idClient: number) {
    return this.collectService.findAllReceivablesByClient(idClient);
  }

  @Get('receivable/:idReceivable')
  findOneReceivable(@Param('idReceivable') idReceivable: number) {
    return this.collectService.findOneReceivable(idReceivable);
  }

  @Get('receivables-week')
  receivablesOfTheWeek() {
    return this.collectService.findReceivablesOfTheWeek();
  }

  @Get('updateState')
  updateReceivableState() {
    return this.updateStateService.updateReceivablesState();
  }
}
