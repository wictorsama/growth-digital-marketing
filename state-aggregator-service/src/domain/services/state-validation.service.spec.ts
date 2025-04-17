import { Test, TestingModule } from '@nestjs/testing';
import { StateValidationService } from './state-validation.service';
import { Logger } from '@nestjs/common';
import { State } from '../entities/state.entity';

describe('StateValidationService', () => {
  let service: StateValidationService;
  let logger: Logger;

  const createValidState = (): Partial<State> => ({
    name: 'California',
    population: 39538223,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateValidationService,
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StateValidationService>(StateValidationService);
    logger = module.get<Logger>(Logger);
  });

  describe('validateState', () => {
    describe('State Name Validation', () => {
      it('should validate a correct state name', () => {
        const result = service.validateState(createValidState());
        expect(result.isValid).toBeTruthy();
      });

      it('should validate state name with hyphen', () => {
        const state = createValidState();
        state.name = 'New-York';
        const result = service.validateState(state);
        expect(result.isValid).toBeTruthy();
      });

      it('should reject state name with special characters', () => {
        const state = createValidState();
        state.name = 'California!';
        const result = service.validateState(state);
        expect(result.isValid).toBeFalsy();
        expect(result.errors).toContain('State name can only contain letters, spaces, and hyphens');
      });

      it('should reject state name shorter than minimum length', () => {
        const state = createValidState();
        state.name = 'A';
        const result = service.validateState(state);
        expect(result.isValid).toBeFalsy();
        expect(result.errors).toContain('State name must be at least 2 characters');
      });
    });

    describe('Population Validation', () => {
      it('should validate correct population', () => {
        const result = service.validateState(createValidState());
        expect(result.isValid).toBeTruthy();
      });

      it('should reject decimal population', () => {
        const state = createValidState();
        state.population = 1000.5;
        const result = service.validateState(state);
        expect(result.isValid).toBeFalsy();
        expect(result.errors).toContain('Population must be an integer');
      });

      it('should reject string population', () => {
        const state = createValidState();
        state.population = '1000' as any;
        const result = service.validateState(state);
        expect(result.isValid).toBeFalsy();
        expect(result.errors).toContain('Population must be an integer');
      });
    });

    describe('Error Logging', () => {
      it('should log error when validation fails', () => {
        service.validateState(null);
        expect(logger.error).toHaveBeenCalled();
      });
    });
  });

  describe('validateStatesBatch', () => {
    describe('Batch Size Validation', () => {
      it('should validate batch within size limit', () => {
        const states = Array(100).fill(createValidState());
        const result = service.validateStatesBatch(states);
        expect(result.isValid).toBeTruthy();
      });

      it('should reject undefined batch', () => {
        const result = service.validateStatesBatch(undefined);
        expect(result.isValid).toBeFalsy();
        expect(result.errors).toContain('Input must be an array of states');
      });
    });

    describe('Batch Content Validation', () => {
      it('should validate mixed valid and invalid states', () => {
        const states = [
          createValidState(),
          { ...createValidState(), population: -1 },
          { ...createValidState(), name: '123' },
        ];
        const result = service.validateStatesBatch(states);
        expect(result.isValid).toBeFalsy();
        expect(result.errors.length).toBe(2);
      });

      it('should maintain error index correlation', () => {
        const states = [
          { ...createValidState(), population: -1 },
          createValidState(),
          { ...createValidState(), name: '123' },
        ];
        const result = service.validateStatesBatch(states);
        expect(result.errors[0]).toContain('State at index 0');
        expect(result.errors[1]).toContain('State at index 2');
      });
    });
  });
});