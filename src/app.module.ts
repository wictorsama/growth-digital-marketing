import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from './infrastructure/database/database.module';
import { StateController } from './presentation/controllers/state.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { StateService } from './application/services/state.service';
import { BatchProcessorService } from './application/services/batch-processor.service';
import { StateRepository } from './infrastructure/repositories/state.repository';
import { StateAggregateService } from './domain/services/state-aggregate.service';
import { StateSchema } from './infrastructure/database/schemas/state.schema';
import { IStateRepository } from '@domain/repositories/state.repository.interface';

export const STATE_REPOSITORY = 'STATE_REPOSITORY';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/states-db'),
    MongooseModule.forFeature([{ name: 'State', schema: StateSchema }]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'state-processing',
    }),
    DatabaseModule,
  ],
  controllers: [StateController, HealthController],
  providers: [
    StateService,
    BatchProcessorService,
    StateAggregateService,
  ],
})
export class AppModule {}
