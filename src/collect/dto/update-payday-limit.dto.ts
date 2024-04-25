import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class UpdatePaydayLimitDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  id_receivable: number;

  @IsDateString()
  @IsNotEmpty()
  new_payday_limit: Date;
}
