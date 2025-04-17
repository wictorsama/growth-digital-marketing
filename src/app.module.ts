import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PhoneController } from './presentation/controllers/phone.controller';
import { BatchProcessorService } from './application/services/batch-processor.service';

@Module({
  imports: [HttpModule],
  controllers: [PhoneController],
  providers: [BatchProcessorService],
})
export class AppModule {}
