import { Controller, Get, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DataProcessorService } from './data-processor.service';
import {
  DataProcessingRequest,
  DataProcessingResponse,
} from 'my/shared';

@Controller()
export class DataProcessorController {
  private readonly logger = new Logger(DataProcessorController.name);

  constructor(private readonly dataProcessorService: DataProcessorService) {}

  @Get()
  getHello(): string {
    return this.dataProcessorService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'data-processor',
    };
  }

  @GrpcMethod('DataProcessingService', 'ProcessUserData')
  async processUserData(
    request: DataProcessingRequest,
  ): Promise<DataProcessingResponse> {
    try {
      if (!request || !request.userData) {
        throw new Error('Invalid request: missing userData');
      }

      this.logger.log(`Processing data for user: ${request.userData.name}`);

      // Process the data and save to Cassandra
      const processedData =
        await this.dataProcessorService.processAndSaveUserData(request);

      return {
        success: true,
        processedData,
        message: 'Data processed and saved successfully',
      };
    } catch (error) {
      this.logger.error(`Error processing data: ${error.message}`);
      return {
        success: false,
        message: `Error processing data: ${error.message}`,
      };
    }
  }

  @Get('users')
  async getAllUsers() {
    try {
      const users = await this.dataProcessorService.getAllProcessedUsers();
      return {
        success: true,
        data: users,
        count: users.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error retrieving users: ${error.message}`);
      return {
        success: false,
        message: `Error retrieving users: ${error.message}`,
      };
    }
  }
}
