import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StateSchema } from './schemas/state.schema';
import { StateRepository } from '../repositories/state.repository';

export const STATE_REPOSITORY = 'STATE_REPOSITORY';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'State', schema: StateSchema }]),
  ],
  providers: [
    {
      provide: STATE_REPOSITORY,
      useClass: StateRepository,
    },
  ],
  exports: [STATE_REPOSITORY],
})
export class DatabaseModule {}