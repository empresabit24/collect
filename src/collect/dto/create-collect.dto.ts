import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCollectDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  id_receivable;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  idcliente;

  @IsString()
  @Length(3, 255)
  @IsNotEmpty()
  description;

  @IsNumber()
  @IsPositive()
  idformapago: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a number with up to 2 decimal places.' },
  )
  @Min(0)
  @Transform(({ value }) => parseFloat(value.toFixed(2)))
  amount: number;

  @IsDateString()
  payment_date: Date;
}
