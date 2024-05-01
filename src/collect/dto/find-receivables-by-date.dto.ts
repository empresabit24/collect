import { IsDateString, IsNotEmpty } from 'class-validator';

export class FindReceivablesByDateDto {
  @IsDateString()
  @IsNotEmpty()
  initialDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
