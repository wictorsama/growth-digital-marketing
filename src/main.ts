import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { CsvReaderService } from './application/services/csv-reader.service';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure validation pipe with proper options
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: false,
  }));

  const config = new DocumentBuilder()
    .setTitle('Phone Records Processor')
    .setDescription('API for processing and sending phone records in batches')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api`);

  const csvService = new CsvReaderService();

  const BATCH_SIZE = 1000;
  const batch: any[] = [];
  let processedCount = 0;
  let skippedCount = 0;

  await csvService.streamCsv(
    'src/data/phone_data.csv',
    async (record) => {
      // Validate record (example: ensure state and name exist)
      if (!record.state || !record.name) {
        skippedCount++;
        return;
      }

      processedCount++;
      batch.push({
        name: record.state,
        population: 1 // Each row represents one person
      });

      if (batch.length >= BATCH_SIZE) {
        try {
          await axios.post('http://localhost:3000/states/batch', { states: batch });
          console.log(`Sent batch of ${batch.length} records`);
        } catch (err) {
          console.error('Failed to send batch:', err);
        }
        batch.length = 0; // Clear batch
      }
    },
    async () => {
      if (batch.length > 0) {
        try {
          await axios.post('http://localhost:3000/states/batch', { states: batch });
          console.log(`Sent final batch of ${batch.length} records`);
        } catch (err) {
          console.error('Failed to send final batch:', err);
        }
      }
      console.log('CSV processing complete.');
      console.log(`Total processed: ${processedCount}`);
      console.log(`Total skipped: ${skippedCount}`);
    },
    (err) => {
      console.error('CSV processing error:', err);
    }
  );
}

bootstrap().catch(error => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
