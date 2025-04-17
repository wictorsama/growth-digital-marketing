import { Injectable, Logger } from '@nestjs/common';
import { IStateRepository } from '@domain/repositories/state.repository.interface';
import { StateAggregateService } from '@domain/services/state-aggregate.service';
import { BatchStateDto } from '@application/dto/state.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Inject } from '@nestjs/common';
import { STATE_REPOSITORY } from '@infrastructure/database/database.module';

@Injectable()
export class BatchProcessorService {
  private readonly logger = new Logger(BatchProcessorService.name);
  private readonly BATCH_SIZE = 1000;
  private readonly PROCESSING_TIMEOUT = 30000; // 30 seconds

  constructor(
    @Inject(STATE_REPOSITORY)
    private readonly stateRepository: IStateRepository,
    private readonly aggregateService: StateAggregateService,
    @InjectQueue('state-processing') private stateQueue: Queue
  ) {}

  async processBatch(batchDto: BatchStateDto) {
    try {
      // Add batch to processing queue
      const job = await this.stateQueue.add('process-states', batchDto, {
        timeout: this.PROCESSING_TIMEOUT,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      });

      const chunks = this.splitIntoBatches(batchDto.states);
      
      // Process chunks with rate limiting
      const results = await Promise.all(
        chunks.map(async (chunk, index) => {
          // Implement rate limiting - 1000 records per second
          await new Promise(resolve => setTimeout(resolve, index * 1000));
          return this.processChunk(chunk);
        })
      );

      const aggregatedData = this.aggregateResults(results);
      await this.updateStateAggregates(aggregatedData);

      await job.finished();
      return aggregatedData;
    } catch (error) {
      this.logger.error(`Batch processing failed: ${error.message}`);
      throw error;
    }
  }

  private splitIntoBatches<T>(items: T[]): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      chunks.push(items.slice(i, i + this.BATCH_SIZE));
    }
    return chunks;
  }

  private async processChunk(states: BatchStateDto['states']) {
    const uniqueStates = this.removeDuplicates(states);
    const validStates = this.filterValidStates(uniqueStates);
    
    const savedStates = await Promise.all(
      validStates.map(state => 
        this.stateRepository.create(state)
          .catch(error => {
            this.logger.warn(`Failed to save state: ${error.message}`);
            return null;
          })
      )
    );

    return this.aggregateService.aggregateStateData(savedStates.filter(Boolean));
  }

  private removeDuplicates(states: BatchStateDto['states']) {
    const seen = new Set();
    return states.filter(state => {
      const key = `${state.name.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private filterValidStates(states: BatchStateDto['states']) {
    return states.filter(state => 
      state && 
      state.name && 
      typeof state.name === 'string' &&
      state.population && 
      typeof state.population === 'number' &&
      state.population > 0
    );
  }

  private async updateStateAggregates(aggregatedData: Map<string, number>) {
    const updates = Array.from(aggregatedData.entries()).map(([name, population]) =>
      this.stateRepository.updateAggregate(name, population)
        .catch(error => {
          this.logger.error(`Failed to update aggregate for ${name}: ${error.message}`);
          return null;
        })
    );

    await Promise.all(updates);
  }

  private aggregateResults(results: Map<string, number>[]) {
    const finalAggregation = new Map<string, number>();
    
    results.forEach(result => {
      result.forEach((population, state) => {
        const currentPopulation = finalAggregation.get(state) || 0;
        finalAggregation.set(state, currentPopulation + population);
      });
    });

    return finalAggregation;
  }
}