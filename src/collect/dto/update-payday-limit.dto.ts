import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class UpdatePaydayLimitDto {
  @IsBoolean()
  @IsNotEmpty()
  oneWeekLater: boolean;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  id_receivable: number;

  @IsDateString()
  @IsOptional()
  new_payday_limit?: Date;
}
