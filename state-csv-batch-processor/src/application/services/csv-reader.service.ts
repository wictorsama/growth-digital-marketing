import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

export class CsvReaderService {
  async streamCsv(
    filePath: string,
    onRecord: (record: any) => Promise<void> | void,
    onEnd?: () => void,
    onError?: (err: Error) => void
  ) {
    const absolutePath = path.resolve(filePath);
    const readStream = fs.createReadStream(absolutePath);
    const parser = parse({ columns: true, skip_empty_lines: true });

    readStream.pipe(parser);

    parser.on('readable', async () => {
      let record;
      while ((record = parser.read()) !== null) {
        await onRecord(record);
      }
    });

    parser.on('end', () => {
      if (onEnd) onEnd();
    });

    parser.on('error', (err) => {
      if (onError) onError(err);
    });
  }
}