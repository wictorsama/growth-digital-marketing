import { Injectable } from '@nestjs/common';
import { State } from '../entities/state.entity';

@Injectable()
export class StateAggregateService {
  aggregateStateData(states: State[]): Map<string, number> {
    return states.reduce((aggregation, state) => {
      const currentPopulation = aggregation.get(state.name) || 0;
      aggregation.set(state.name, currentPopulation + state.population);
      return aggregation;
    }, new Map<string, number>());
  }

  calculateTotalPopulation(states: State[]): number {
    return states.reduce((total, state) => total + state.population, 0);
  }

  getStateStatistics(states: State[]): { 
    totalStates: number; 
    totalPopulation: number; 
    averagePopulation: number 
  } {
    const totalStates = states.length;
    const totalPopulation = this.calculateTotalPopulation(states);
    
    return {
      totalStates,
      totalPopulation,
      averagePopulation: totalStates > 0 ? totalPopulation / totalStates : 0
    };
  }
}