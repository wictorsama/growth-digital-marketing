import { Schema, Document } from 'mongoose';

export interface StateDocument extends Document {
  name: string;
  population: number;
  lastUpdated: Date;
}

export const StateSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  population: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});