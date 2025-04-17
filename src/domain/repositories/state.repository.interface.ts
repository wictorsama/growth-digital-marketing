import { State } from '../entities/state.entity';

export interface IStateRepository {
  findAll(): Promise<State[]>;
  findById(id: string): Promise<State | null>;
  create(state: any): Promise<State>;
  update(id: string, state: Partial<State>): Promise<State>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
  updateOne(filter: any, update: any, options?: any): Promise<any>;
  aggregate(pipeline: any[]): Promise<any[]>;
  updateAggregate(name: string, population: number): Promise<State | null>;
  findByName(name: string): Promise<State | null>;
  countStates(): Promise<number>; // <-- Add this line
}