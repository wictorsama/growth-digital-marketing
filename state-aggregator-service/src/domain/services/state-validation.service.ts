import { Injectable, Logger } from '@nestjs/common';
import { State } from '../entities/state.entity';
import { ValidationResult } from '../types/validation-result.type';
import { StateValidationException } from '../exceptions/state-validation.exception';

@Injectable()
export class StateValidationService {
  constructor(private readonly logger: Logger) {}
  private readonly MAX_POPULATION = 1000000000;
  private readonly MIN_STATE_NAME_LENGTH = 2;
  private readonly MAX_BATCH_SIZE = 10000;

  validateState(state: Partial<State>): ValidationResult {
    try {
      if (!state) {
        throw new StateValidationException('State object cannot be null or undefined');
      }

      const errors: string[] = [];
      const nameValidation = this.validateStateName(state.name);
      const populationValidation = this.validateStatePopulation(state.population);

      if (!nameValidation.isValid) {
        errors.push(nameValidation.error);
      }

      if (!populationValidation.isValid) {
        errors.push(populationValidation.error);
      }

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      const errorMessage = error instanceof StateValidationException 
        ? error.message 
        : `Unexpected validation error: ${error.message}`;
      
      this.logger.error(errorMessage);
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }

  validateStatesBatch(states: Partial<State>[]): ValidationResult {
    try {
      if (!Array.isArray(states)) {
        throw new StateValidationException('Input must be an array of states');
      }

      if (states.length === 0) {
        throw new StateValidationException('States batch cannot be empty');
      }

      if (states.length > this.MAX_BATCH_SIZE) {
        throw new StateValidationException(`Batch size exceeds maximum limit of ${this.MAX_BATCH_SIZE}`);
      }

      const errors: string[] = [];
      states.forEach((state, index) => {
        const result = this.validateState(state);
        if (!result.isValid && result.errors) {
          errors.push(`State at index ${index}: ${result.errors.join(', ')}`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      const errorMessage = error instanceof StateValidationException 
        ? error.message 
        : `Unexpected batch validation error: ${error.message}`;
      
      this.logger.error(errorMessage);
      return {
        isValid: false,
        errors: [errorMessage]
      };
    }
  }

  private validateStateName(name: string): { isValid: boolean; error?: string } {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: 'State name must be a non-empty string' };
    }

    const trimmedName = name.trim();
    if (trimmedName.length < this.MIN_STATE_NAME_LENGTH) {
      return { isValid: false, error: `State name must be at least ${this.MIN_STATE_NAME_LENGTH} characters` };
    }

    if (!/^[a-zA-Z\s-]+$/.test(trimmedName)) {
      return { isValid: false, error: 'State name can only contain letters, spaces, and hyphens' };
    }

    return { isValid: true };
  }

  private validateStatePopulation(population: number): { isValid: boolean; error?: string } {
    if (population === undefined || population === null) {
      return { isValid: false, error: 'Population is required' };
    }

    if (typeof population !== 'number' || !Number.isInteger(population)) {
      return { isValid: false, error: 'Population must be an integer' };
    }

    if (population < 0) {
      return { isValid: false, error: 'Population cannot be negative' };
    }

    if (population > this.MAX_POPULATION) {
      return { isValid: false, error: `Population cannot exceed ${this.MAX_POPULATION}` };
    }

    return { isValid: true };
  }
}