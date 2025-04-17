import { Controller, Post, Body } from '@nestjs/common';
import { CsvProcessorService } from '../services/csv-processor.service';

@Controller('consumer')
export class ConsumerController {
  constructor(private readonly csvProcessorService: CsvProcessorService) {}

  @Post('batch')
  async processBatch(@Body() batch: { name: string; population: number }[]) {
    // Use processStateData instead of processBatch
    return await this.csvProcessorService.processStateData(batch);
  }
}
