import { Test, TestingModule } from '@nestjs/testing';
import { StateController } from '@presentation/controllers/state.controller';
import { BatchProcessorService } from '@application/services/batch-processor.service';
import { IStateRepository } from '@domain/repositories/state.repository.interface';

describe('StateController', () => {
  let controller: StateController;
  let batchProcessor: BatchProcessorService;
  // Remove: let stateRepository: IStateRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StateController],
      providers: [
        {
          provide: BatchProcessorService,
          useValue: {
            processBatch: jest.fn(),
          },
        },
        {
          provide: 'STATE_REPOSITORY',
          useValue: {
            findAll: jest.fn(),
            updateOne: jest.fn().mockResolvedValue(undefined), // <-- Add this line
          },
        },
      ],
    }).compile();

    controller = module.get<StateController>(StateController);
    batchProcessor = module.get<BatchProcessorService>(BatchProcessorService);
    // Remove: stateRepository = module.get<IStateRepository>('IStateRepository');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('processBatch', () => {
    it('should process batch successfully', async () => {
      const mockBatch = {
        states: [
          { name: 'California', population: 39538223 },
        ],
      };
      const mockResult = new Map([['California', 39538223]]);
      
      jest.spyOn(batchProcessor, 'processBatch').mockResolvedValue(mockResult);

      const result = await controller.processBatch(mockBatch);
      
      expect(result.success).toBeTruthy();
      expect(result.processedStates).toBe(1);
    });
  });
});