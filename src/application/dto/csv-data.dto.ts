import { IsString, IsNumber, Min } from 'class-validator';

export class CsvDataDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  population: number;
}