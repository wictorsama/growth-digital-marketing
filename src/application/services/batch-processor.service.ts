import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PhoneRecord } from '../../domain/entities/phone-record.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BatchProcessorService {
  private readonly logger = new Logger(BatchProcessorService.name);
  private readonly BATCH_SIZE = 1000;
  private readonly API_URL = 'http://localhost:3001/api/records';

  constructor(private readonly httpService: HttpService) {}

  async processBatches(records: PhoneRecord[]): Promise<void> {
    const batches = this.createBatches(records);
    
    for (let i = 0; i < batches.length; i++) {
      await this.sendBatch(batches[i], i + 1);
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private createBatches(records: PhoneRecord[]): PhoneRecord[][] {
    const batches: PhoneRecord[][] = [];
    for (let i = 0; i < records.length; i += this.BATCH_SIZE) {
      batches.push(records.slice(i, i + this.BATCH_SIZE));
    }
    return batches;
  }

  private async sendBatch(batch: PhoneRecord[], batchNumber: number): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.API_URL, batch)
      );
      this.logger.log(`Successfully sent batch ${batchNumber} with ${batch.length} records. Status: ${response.status}`);
    } catch (error) {
      throw new Error(`Failed to send batch ${batchNumber}: ${error.message}`);
    }
  }
}