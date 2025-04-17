import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StateRepository } from './state.repository';
import { StateDocument } from '../database/schemas/state.schema';

describe('StateRepository', () => {
  let repository: StateRepository;
  let model: Model<StateDocument>;

  const mockState = {
    name: 'California',
    population: 39538223,
  };

  beforeEach(async () => {
    const mockModel: any = function (state: any) {
      return {
        ...state,
        save: jest.fn().mockResolvedValue(mockState),
      };
    };
    mockModel.create = jest.fn();
    mockModel.findOneAndUpdate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateRepository,
        {
          provide: getModelToken('State'),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<StateRepository>(StateRepository);
    model = module.get<Model<StateDocument>>(getModelToken('State'));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new state', async () => {
      jest.spyOn(model, 'create').mockResolvedValueOnce(mockState as any);
      const result = await repository.create(mockState);
      expect(result).toEqual(mockState);
    });
  });

  describe('updateAggregate', () => {
    it('should update state population', async () => {
      const updatedState = { ...mockState, population: 40000000 };
      jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedState),
      } as any);

      const result = await repository.updateAggregate('California', 40000000);
      expect(result).toEqual(updatedState);
    });
  });
});