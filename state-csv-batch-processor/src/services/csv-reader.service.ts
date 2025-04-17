import { Readable, Transform } from 'stream';
import { parse } from 'csv-parse';
import { throttle } from 'lodash';

export class CsvReaderService {
  private readonly sendThrottled: Function;
  private readonly batchSize = 1000;
  private batch: any[] = [];

  constructor() {
    this.sendThrottled = throttle(this.sendBatch.bind(this), 1000, { leading: true });
  }

  private async sendBatch(data: any[]) {
    try {
      await fetch('http://localhost:3001/states/batch', {  // Updated port to 3001
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ states: data }),
      });
    } catch (error) {
      console.error('Failed to send batch:', error);
    }
  }

  private validateChunk(chunk: any): boolean {
    return chunk && 
           chunk.state_name && 
           typeof chunk.state_name === 'string' &&
           chunk.population && 
           !isNaN(Number(chunk.population)) &&
           Number(chunk.population) > 0;
  }

  private normalizeChunk(chunk: any) {
    return {
      name: chunk.state_name.trim(),
      population: Number(chunk.population)
    };
  }

  private createParser() {
    return new Transform({
      objectMode: true,
      transform: (chunk, _, callback) => {
        if (this.validateChunk(chunk)) {
          callback(null, this.normalizeChunk(chunk));
        } else {
          callback();
        }
      }
    });
  }

  async processBatch(batch: any[]) {
    await this.sendThrottled(batch);
  }

  processFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Implement CSV file processing logic here
      console.log(`Processing file: ${filePath}`);
      // Simulate processing
      setTimeout(() => {
        console.log('File processed successfully.');
        resolve();
      }, 1000);
    });
  }
}