import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  UserData,
  DataProcessingRequest,
  ProcessedData,
  DataProcessingResponse,
} from 'my/shared';

interface DataProcessingService {
  ProcessUserData(
    request: DataProcessingRequest,
  ): Observable<DataProcessingResponse>;
}

@Injectable()
export class ApiGatewayService implements OnModuleInit {
  private readonly logger = new Logger(ApiGatewayService.name);
  private dataProcessingService: DataProcessingService;

  constructor(
    @Inject('DATA_PROCESSING_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    try {
      this.dataProcessingService =
        this.client.getService<DataProcessingService>('DataProcessingService');
      this.logger.log('gRPC client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize gRPC client:', error);
    }
  }

  getHello(): string {
    return 'Hello from API Gateway! Ready to process user data.';
  }

  async processUserData(userData: UserData): Promise<ProcessedData> {
    try {
      const requestId = this.generateRequestId();

      // Add timestamp to user data
      const enrichedUserData = {
        ...userData,
        timestamp: new Date().toISOString(),
      };

      const request: DataProcessingRequest = {
        userData: enrichedUserData,
        sourceApp: 'api-gateway',
        requestId,
      };

      // Call data processor via gRPC
      const response = await this.dataProcessingService
        .ProcessUserData(request)
        .toPromise();

      if (!response || !response.success) {
        throw new Error(response?.message || 'Data processing failed');
      }

      this.logger.log(`Successfully processed data for user: ${userData.name}`);
      return response.processedData!;
    } catch (error) {
      this.logger.error(`Error processing user data: ${error.message}`);
      throw error;
    }
  }

  async getAllProcessedUsers(): Promise<ProcessedData[]> {
    try {
      // Make HTTP call to Data Processor's /users endpoint
      const response = await fetch('http://localhost:3002/users');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to retrieve users');
      }

      return result.data || [];
    } catch (error) {
      this.logger.error(`Error retrieving users: ${error.message}`);
      // Return empty array instead of throwing to gracefully handle the error
      return [];
    }
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
