import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { State } from '@domain/entities/state.entity';
import { IStateRepository } from '@domain/repositories/state.repository.interface';

@Injectable()
export class StateRepository implements IStateRepository {
  constructor(
    @InjectModel('State') private readonly stateModel: Model<State>
  ) {}

  async create(state: any): Promise<State> {
    const createdState = new this.stateModel(state);
    return createdState.save();
  }

  async findAll(): Promise<State[]> {
    return this.stateModel.find().exec();
  }

  async findById(id: string): Promise<State> {
    return this.stateModel.findById(id).exec();
  }

  async findByName(name: string): Promise<State> {
    return this.stateModel.findOne({ name }).exec();
  }

  async update(id: string, state: Partial<State>): Promise<State> {
    return this.stateModel.findByIdAndUpdate(id, state, { new: true }).exec();
  }

  async updateAggregate(name: string, population: number): Promise<State> {
    return this.stateModel.findOneAndUpdate(
      { name },
      { $set: { population } },
      { new: true, upsert: true }
    ).exec();
  }

  async delete(id: string): Promise<void> {
    await this.stateModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.stateModel.deleteMany({});
  }

  async aggregateStates() {
    return this.stateModel.aggregate([
      {
        $group: {
          _id: null,
          totalPopulation: { $sum: "$population" },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  // Add these methods to match the interface
  async updateOne(filter: any, update: any, options?: any): Promise<any> {
    return this.stateModel.updateOne(filter, update, options).exec();
  }

  async countStates(): Promise<number> {
    return this.stateModel.countDocuments().exec();
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.stateModel.aggregate(pipeline).exec();
  }
}