import { Controller, Get, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DataProcessorService } from './data-processor.service';

interface UserData {
  name: string;
  email: string;
  age: number;
  timestamp?: string;
}

interface DataProcessingRequest {
  userData: UserData;
  sourceApp: string;
  requestId: string;
}

interface ProcessedData {
  id: string;
  name: string;
  email: string;
  age: number;
  processedBy: string;
  enrichedInfo: string;
  timestamp: string;
  processingTimestamp: string;
}

interface DataProcessingResponse {
  success: boolean;
  processedData?: ProcessedData;
  message?: string;
}

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
      service: 'data-processor'
    };
  }

  @GrpcMethod('DataProcessingService', 'ProcessUserData')
  async processUserData(request: DataProcessingRequest): Promise<DataProcessingResponse> {
    try {
      this.logger.log(`Received gRPC request: ${request.requestId} from ${request.sourceApp}`);
      
      // Process the data and save to Cassandra
      const processedData = await this.dataProcessorService.processAndSaveUserData(request);
      
      this.logger.log(`Successfully processed and saved data for user: ${request.userData.name}`);
      
      return {
        success: true,
        processedData,
        message: 'Data processed and saved successfully'
      };
    } catch (error) {
      this.logger.error(`Error processing data: ${error.message}`);
      return {
        success: false,
        message: `Error processing data: ${error.message}`
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
        message: `Error retrieving users: ${error.message}`
      };
    }
  }
}
