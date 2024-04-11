import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Length,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReceivableDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  idcliente: number;

  @IsNotEmpty()
  @Length(3, 255)
  description: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },

    { message: 'El monto debe ser un número de hasta 2 decimales.' },
  )
  @Min(0)
  @Transform(({ value }) => parseFloat(value.toFixed(2)))
  total_amount: number;

  @IsDateString()
  payday_limit: Date;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  iddocumentoventa: number;
}
