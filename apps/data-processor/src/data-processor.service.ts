import { Injectable, Logger } from '@nestjs/common';
import { CassandraService } from 'wp/cassandra';

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

@Injectable()
export class DataProcessorService {
  private readonly logger = new Logger(DataProcessorService.name);

  constructor(private readonly cassandraService: CassandraService) {}

  getHello(): string {
    return 'Hello from Data Processor! Ready to process and store data.';
  }

  async processAndSaveUserData(request: DataProcessingRequest): Promise<ProcessedData> {
    try {
      const { userData, sourceApp, requestId } = request;
      
      // Add enrichment information
      const enrichedInfo = this.generateEnrichedInfo(userData, sourceApp);
      
      // Create processed data object
      const processedData: ProcessedData = {
        id: '', // Will be set by Cassandra service
        name: userData.name,
        email: userData.email,
        age: userData.age,
        processedBy: 'data-processor-service',
        enrichedInfo,
        timestamp: userData.timestamp || new Date().toISOString(),
        processingTimestamp: new Date().toISOString(),
      };

      this.logger.log(`Processing data for user: ${userData.name} from ${sourceApp}`);

      // Save to Cassandra
      const savedId = await this.cassandraService.saveProcessedData({
        ...processedData,
        timestamp: new Date(processedData.timestamp),
        processingTimestamp: new Date(processedData.processingTimestamp),
      });

      // Return the processed data with the saved ID
      const result = {
        ...processedData,
        id: savedId,
      };

      this.logger.log(`Successfully saved data with ID: ${savedId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error processing and saving user data: ${error.message}`);
      throw error;
    }
  }

  async getAllProcessedUsers(): Promise<ProcessedData[]> {
    try {
      this.logger.log('Retrieving all processed users from Cassandra');
      
      const data = await this.cassandraService.getAllProcessedData();
      
      // Convert Date objects to ISO strings for response
      return data.map(item => ({
        id: item.id || '',
        name: item.name,
        email: item.email,
        age: item.age,
        processedBy: item.processedBy,
        enrichedInfo: item.enrichedInfo,
        timestamp: item.timestamp instanceof Date ? item.timestamp.toISOString() : item.timestamp?.toString() || '',
        processingTimestamp: item.processingTimestamp instanceof Date ? item.processingTimestamp.toISOString() : item.processingTimestamp?.toString() || '',
      }));
    } catch (error) {
      this.logger.error(`Error retrieving users: ${error.message}`);
      throw error;
    }
  }

  private generateEnrichedInfo(userData: UserData, sourceApp: string): string {
    const ageGroup = this.getAgeGroup(userData.age);
    const emailDomain = userData.email.split('@')[1];
    
    return `User from ${sourceApp} | Age group: ${ageGroup} | Email domain: ${emailDomain} | Processed at: ${new Date().toISOString()}`;
  }

  private getAgeGroup(age: number): string {
    if (age < 18) return 'Minor';
    if (age < 30) return 'Young Adult';
    if (age < 50) return 'Adult';
    if (age < 65) return 'Middle-aged';
    return 'Senior';
  }
}
