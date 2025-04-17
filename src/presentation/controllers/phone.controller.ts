import { Controller, Post, Logger } from '@nestjs/common';
import { BatchProcessorService } from '../../application/services/batch-processor.service';

@Controller('phone')
export class PhoneController {
  private readonly logger = new Logger(PhoneController.name);

  constructor(private readonly batchProcessorService: BatchProcessorService) {}

  @Post('process')
  async processPhoneData() {
    try {
      // You need to implement or inject a way to get the records here,
      // or remove this endpoint if it's not needed.
      // For now, we'll just log and return a not implemented message.
      this.logger.warn('processPhoneData endpoint is not implemented: missing data source.');
      return {
        message: 'Phone data processing is not implemented. Data source is missing.',
        totalRecords: 0
      };
    } catch (error) {
      this.logger.error('Failed to process phone data:', error);
      throw error;
    }
  }
}