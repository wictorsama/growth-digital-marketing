import { Injectable, Logger } from '@nestjs/common';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { PhoneRecord } from '../../domain/entities/phone-record.entity';
import { join } from 'path';

@Injectable()
export class CsvReaderService {
  private readonly logger = new Logger(CsvReaderService.name);
  private readonly dataPath = join(__dirname, '..', '..', 'data');

  async readPhoneData(): Promise<PhoneRecord[]> {
    const filePath = join(this.dataPath, 'phone_data.csv');
    return new Promise((resolve, reject) => {
      const records: PhoneRecord[] = [];
      let invalidRecords = 0;

      createReadStream(filePath)
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on('data', (row) => {
          try {
            const record = PhoneRecord.fromCsv(row);
            if (record.isValidPhone() && record.isValidState()) {
              records.push(record);
            } else {
              invalidRecords++;
              this.logger.warn(`Invalid record found: ${JSON.stringify(row)}`);
            }
          } catch (error) {
            this.logger.error(`Error processing row: ${JSON.stringify(row)}`, error);
            invalidRecords++;
          }
        })
        .on('error', (error) => {
          this.logger.error('Error reading CSV file', error);
          reject(error);
        })
        .on('end', () => {
          this.logger.log(`Successfully processed ${records.length} valid records. Found ${invalidRecords} invalid records.`);
          resolve(records);
        });
    });
  }
}