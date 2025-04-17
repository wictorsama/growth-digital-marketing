import { CsvDataDto } from '@application/dto/csv-data.dto';
import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStateDto extends CsvDataDto {}

export class BatchStateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStateDto)
  states: CreateStateDto[];
}

export class StateAggregationDto {
  @IsOptional()
  name: string;

  totalPopulation: number;
}