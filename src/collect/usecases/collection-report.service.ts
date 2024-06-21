import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workbook } from 'exceljs';
import { differenceInDays } from 'date-fns';
import { receivable } from '../entities/receivable.entity';

@Injectable()
export class CollectionReportService {
  private readonly logger = new Logger(CollectionReportService.name);

  constructor(
    @InjectRepository(receivable)
    private readonly receivableRepository: Repository<receivable>,
  ) {}

  // Obtener el índice de la lista cuyo receivable es el más cercano
  private findClosestPaydayIndex(collectList: receivable[]): number {
    const today = new Date();
    let closestIndex = -1;
    let smallestDifference = Infinity;

    collectList.forEach((receivable, index) => {
      const paydayLimit = receivable.payday_limit;
      const difference = Math.abs(differenceInDays(today, paydayLimit));

      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestIndex = index;
      }
    });
    // Retorna el índice de la lista de 'receivables'
    return closestIndex;
  }

  async generateExcelFile(): Promise<Buffer> {
    try {
      this.logger.log('El reporte está creándose');
      const collectList = await this.receivableRepository
        .createQueryBuilder('receivable')
        //.leftJoinAndSelect('receivable.collects', 'collect')
        .innerJoinAndSelect('receivable.infoCliente', 'cliente')
        .innerJoinAndSelect('cliente.infoPersona', 'persona')
        .innerJoinAndSelect('receivable.tipo_estado', 'tipo_estado')
        .orderBy('receivable.payday_limit', 'DESC')
        .getMany();

      // Obtener el índice de la lista cuyo receivable es el más cercano
      const closestIndex = this.findClosestPaydayIndex(collectList);
      this.logger.log(`Índice más cercano a la fecha actual: ${closestIndex}`);

      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Cuentas');

      // Configuración de las columnas del Excel
      worksheet.columns = [
        { header: 'N°', key: 'id', width: 5 },
        { header: 'Cuenta por cobrar', key: 'receivable', width: 30 },
        { header: 'Cliente', key: 'client', width: 35 },
        { header: 'Monto Total', key: 'amount', width: 20 },
        { header: 'Monto Pendiente', key: 'pending_amount', width: 20 },
        { header: 'Fecha de registro', key: 'fecha_registro', width: 20 },
        { header: 'Fecha límite de pago', key: 'payday_limit', width: 20 },
        { header: 'Estado', key: 'state', width: 15 },
      ];

      // Estilos a la primera fila (headers)
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };

      // Estilos a G1 ('Fecha límite de pago')
      worksheet.getCell('G1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' },
      };

      // Establece el formato de moneda para las columnas
      const formatoContable =
        '_("S/"* #,##0.00_);_("S/"* (#,##0.00);_("S/"* "-"??_);_(@_)';
      worksheet.getColumn(4).numFmt = formatoContable;
      worksheet.getColumn(5).numFmt = formatoContable;

      // Variables para calcular el índice y los totales
      let index = 1;
      let totalAmount = 0;
      let totalPendingAmount = 0;

      // Procesando los datos en cada fila
      collectList.forEach((collect) => {
        const infoPersona = collect.infoCliente.infoPersona;
        const detalleNombre = infoPersona.nombres
          ? infoPersona.nombres +
            ' ' +
            infoPersona.apellidopaterno +
            ' ' +
            infoPersona.apellidomaterno
          : infoPersona.razonsocial;

        worksheet.addRow({
          id: index,
          receivable: collect.description,
          client: detalleNombre,
          amount: Number(collect.total_amount),
          pending_amount: Number(collect.pending_amount),
          fecha_registro: collect.fecha_registro,
          payday_limit: collect.payday_limit,
          state: collect.tipo_estado.description,
        });

        index = index + 1;
        totalAmount += Number(collect.total_amount);
        totalPendingAmount += Number(collect.pending_amount);
      });

      // Agrega una fila al final de la tabla con los totales
      const totalRow = worksheet.addRow([
        '',
        '',
        'TOTAL',
        totalAmount,
        totalPendingAmount,
      ]);

      // Establece el estilo de la fila de totales
      totalRow.font = { bold: true };

      // Sombrea el receivable cuyo payday_limit es más cercano a la fecha actual
      worksheet.getRow(Number(closestIndex + 2)).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: '#FFFF66' },
      };

      this.logger.log('El reporte en Excel fue creado.');
      // Escribir el contenido del libro a un buffer
      const buffer = await workbook.xlsx.writeBuffer();
      // @ts-expect-error nada
      return buffer;
    } catch (error) {
      console.log(error);
    }
  }
}
