import { Inject, Injectable } from '@nestjs/common';
import { STATE_REPOSITORY } from '@infrastructure/database/database.module'; // <-- update import
import { IStateRepository } from '@domain/repositories/state.repository.interface';

@Injectable()
export class StateService {
  constructor(
    @Inject(STATE_REPOSITORY)
    private readonly stateRepository: IStateRepository
  ) {}

  async updateStatePopulation(data: { name: string; population: number }) {
    try {
      const existingState = await this.stateRepository.findByName(data.name);
      const newPopulation = data.population;

      // Use updateAggregate instead of updatePopulation
      await this.stateRepository.updateAggregate(data.name, newPopulation);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update state population: ${error.message}`);
    }
  }
}