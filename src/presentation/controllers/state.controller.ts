import { Controller, Post, Body, Inject, Get, Delete, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BatchProcessorService } from '@application/services/batch-processor.service';
import { IStateRepository } from '@domain/repositories/state.repository.interface';
import { STATE_REPOSITORY } from '@infrastructure/database/database.module';
import { BatchStateDto } from '@application/dto/state.dto';

@ApiTags('States')
@Controller('states')
export class StateController {
  private readonly logger = new Logger(StateController.name);

  constructor(
    private readonly batchProcessorService: BatchProcessorService,
    @Inject(STATE_REPOSITORY)
    private readonly stateRepository: IStateRepository
  ) {}

  @Post('batch')
  @ApiOperation({ summary: 'Process a batch of state records' })
  @ApiResponse({ status: 201, description: 'Batch processed successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to process state batch.' })
  async processBatch(@Body() batchDto: BatchStateDto) {
    this.logger.log('Received batch:', batchDto);
    try {
      this.logger.log(`Received batch with ${batchDto.states.length} states`);
      // Aggregate incoming batch by state name to avoid duplicates in the same batch
      const stateMap = new Map<string, number>();
      for (const state of batchDto.states) {
        if (!state.name || typeof state.population !== 'number') continue;
        stateMap.set(
          state.name,
          (stateMap.get(state.name) || 0) + state.population
        );
      }

      // Upsert each state in the database, summing populations
      for (const [name, population] of stateMap.entries()) {
        await this.stateRepository.updateOne(
          { name },
          { $inc: { population } },
          { upsert: true }
        );
      }

      return {
        success: true,
        processedStates: stateMap.size,
        aggregatedData: Array.from(stateMap.entries()).map(([state, population]) => ({
          state,
          population
        }))
      };
    } catch (error) {
      this.logger.error(`Batch processing failed: ${error.message}`);
      throw new HttpException(
        'Failed to process state batch',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('aggregates')
  @ApiOperation({ summary: 'Get aggregated population per state' })
  @ApiResponse({ status: 200, description: 'Aggregated data returned.' })
  @ApiResponse({ status: 500, description: 'Failed to aggregate states.' })
  async getAggregates() {
    try {
      // Aggregate total population per state
      const states = await this.stateRepository.aggregate([
        {
          $group: {
            _id: '$name',
            totalPopulation: { $sum: '$population' }
          }
        }
      ]);
      return states.map(s => ({
        state: s._id,
        totalPopulation: s.totalPopulation
      }));
    } catch (error) {
      this.logger.error(`Failed to aggregate states: ${error.message}`);
      throw new HttpException(
        'Failed to aggregate states',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getStateAggregates() {
    try {
      const states = await this.stateRepository.findAll();
      return states.map(state => ({
        name: state.name,
        totalPopulation: state.population
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch state aggregates: ${error.message}`);
      throw new HttpException(
        'Failed to fetch state aggregates',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('count')
  @ApiOperation({ summary: 'Get the count of state records' })
  @ApiResponse({ status: 200, description: 'Count returned.' })
  async getStateCount() {
    return { count: await this.stateRepository.countStates() };
  }

  @Delete('all')
  @ApiOperation({ summary: 'Delete all state records' })
  @ApiResponse({ status: 200, description: 'All states deleted.' })
  @ApiResponse({ status: 500, description: 'Failed to delete all states.' })
  async deleteAllStates() {
    try {
      await this.stateRepository.deleteAll();
      return { success: true, message: 'All states deleted.' };
    } catch (error) {
      this.logger.error(`Failed to delete all states: ${error.message}`);
      throw new HttpException(
        'Failed to delete all states',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  // Optionally, you can add @ApiOperation to getStateAggregates if you expose it as a route.
}