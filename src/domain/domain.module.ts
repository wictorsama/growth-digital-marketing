import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { State, StateSchema } from './entities/state.entity';
import { StateRepository } from '../infrastructure/repositories/state.repository';
import { StateAggregateService } from './services/state-aggregate.service';
import { StateValidationService } from './services/state-validation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: State.name, schema: StateSchema }
    ])
  ],
  providers: [
    {
      provide: 'IStateRepository',
      useClass: StateRepository
    },
    StateAggregateService,
    StateValidationService
  ],
  exports: [
    'IStateRepository',
    StateAggregateService,
    StateValidationService
  ]
})
export class DomainModule {}