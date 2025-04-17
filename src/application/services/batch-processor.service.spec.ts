import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { BatchProcessorService } from './batch-processor.service';
import { PhoneRecord } from '../../domain/entities/phone-record.entity';
import { of } from 'rxjs';

describe('BatchProcessorService', () => {
  let service: BatchProcessorService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchProcessorService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue(of({ status: 200, data: {} })),
          },
        },
      ],
    }).compile();

    service = module.get<BatchProcessorService>(BatchProcessorService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should process batches correctly', async () => {
    const mockRecords = [
      new PhoneRecord('1', 'John Doe', '(11) 98765-4321', 'SP'),
      new PhoneRecord('2', 'Jane Doe', '(21) 98765-4321', 'RJ'),
    ];

    await service.processBatches(mockRecords);

    expect(httpService.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([expect.any(PhoneRecord)])
    );
  });
});