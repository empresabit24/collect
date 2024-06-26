import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { Response } from 'express';

import { CollectService } from './usecases/collect.service';
import { ActualizarEstadoService } from './usecases/actualizar-estado.service';
import { CollectionReportService } from './usecases/collection-report.service';
import { WeeklyReceivablesService } from './usecases/weekly-receivables.service';

import { CreateCollectDto } from './dto/create-collect.dto';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdatePaydayLimitDto } from './dto/update-payday-limit.dto';
import { FindReceivablesByDateDto } from './dto/find-receivables-by-date.dto';

@Controller('collect')
export class CollectController {
  constructor(
    private readonly collectService: CollectService,
    private readonly updateStateService: ActualizarEstadoService,
    private readonly collectionReport: CollectionReportService,
    private readonly weeklyReceivablesService: WeeklyReceivablesService,
  ) {}

  @Post('createReceivable')
  createReceivable(@Body() createReceivableDto: CreateReceivableDto) {
    return this.collectService.createReceivable(createReceivableDto);
  }
  @Post('createCollect')
  createCollect(@Body() createCollectDto: CreateCollectDto) {
    return this.collectService.createCollect(createCollectDto);
  }

  @Post('updatePaydayLimit')
  updatePaydayLimit(@Body() updatePaydayLimitDto: UpdatePaydayLimitDto) {
    return this.collectService.updatePaydayLimit(updatePaydayLimitDto);
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
    return this.weeklyReceivablesService.findReceivablesOfTheWeek();
  }
  @Get('receivables-overdue')
  overdueReceivables() {
    return this.weeklyReceivablesService.findOverdueReceivables();
  }

  @Post('receivables-by-date')
  receivablesByDate(
    @Body() findReceivablesByDateDto: FindReceivablesByDateDto,
  ) {
    return this.weeklyReceivablesService.findReceivablesByDate(
      findReceivablesByDateDto,
    );
  }

  @Get('updateState')
  updateReceivableState() {
    return this.updateStateService.updateReceivablesState();
  }

  @Get('createReport')
  async createCollectionReport(@Res() res: Response) {
    try {
      const excelBuffer = await this.collectionReport.generateExcelFile();
      res.set(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.set(
        'Content-Disposition',
        `attachment; filename=Reporte_Cuentas_Por_Cobrar.xlsx`,
      );

      res.send(excelBuffer);
      console.log('El buffer fue enviado');
    } catch (error) {
      console.error('Error al crear el reporte', error);
      res.status(500).send(`Error al crear el reporte ${error}`);
    }
  }
}
