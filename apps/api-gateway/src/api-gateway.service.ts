import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { promisify } from 'util';

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

interface DataProcessingService {
  ProcessUserData(request: DataProcessingRequest): Promise<DataProcessingResponse>;
}

@Injectable()
export class ApiGatewayService implements OnModuleInit {
  private readonly logger = new Logger(ApiGatewayService.name);
  private dataProcessingService: DataProcessingService;

  async onModuleInit() {
    try {
      // Load the proto file
      const packageDefinition = protoLoader.loadSync(
        join(process.cwd(), 'proto/data-processing.proto'),
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        }
      );

      const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
      
      // Create gRPC client
      const client = new protoDescriptor.dataprocessing.DataProcessingService(
        'localhost:50051',
        grpc.credentials.createInsecure()
      );

      this.dataProcessingService = client;
      this.logger.log('gRPC client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize gRPC client', error);
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

      this.logger.log(`Sending gRPC request with ID: ${requestId}`);

      const request: DataProcessingRequest = {
        userData: enrichedUserData,
        sourceApp: 'api-gateway',
        requestId,
      };

      // Call data processor via gRPC
      const processUserDataAsync = promisify(this.dataProcessingService.ProcessUserData.bind(this.dataProcessingService));
      const response = await processUserDataAsync(request) as DataProcessingResponse;

      if (!response.success) {
        throw new Error(response.message || 'Data processing failed');
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
      // For this example, we'll call a simple endpoint on the data processor
      // In a real implementation, you might want to add this to the proto definition
      this.logger.log('Retrieving all processed users...');
      
      // This is a simplified version - in practice you'd add this to your gRPC service
      // For now, return empty array or implement a REST call to data processor
      return [];
    } catch (error) {
      this.logger.error(`Error retrieving users: ${error.message}`);
      throw error;
    }
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
