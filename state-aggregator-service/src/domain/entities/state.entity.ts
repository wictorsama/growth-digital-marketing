import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class State extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  population: number;
}

export const StateSchema = SchemaFactory.createForClass(State);