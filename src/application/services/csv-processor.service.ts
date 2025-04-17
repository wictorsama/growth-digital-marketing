import { Injectable } from '@nestjs/common';
import { StateService } from './state.service';

@Injectable()
export class CsvProcessorService {
  constructor(private readonly stateService: StateService) {}

  async processStateData(data: { name: string; population: number }[]) {
    try {
      for (const stateData of data) {
        // Use updateStatePopulation instead of processStateData
        await this.stateService.updateStatePopulation(stateData);
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to process state data: ${error.message}`);
    }
  }
}