import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StateController } from './presentation/controllers/state.controller';
import { StateService } from './application/services/state.service';
import { StateRepository } from './infrastructure/repositories/state.repository';
import { State, StateSchema } from './domain/entities/state.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: State.name, schema: StateSchema }
    ])
  ],
  controllers: [StateController],
  providers: [
    StateService,
    {
      provide: 'IStateRepository',
      useClass: StateRepository
    }
  ],
})
export class StateModule {}