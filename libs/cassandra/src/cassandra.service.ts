import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { ProcessedData } from 'my/shared';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CassandraService.name);
  private client: Client;

  async onModuleInit() {
    try {
      // Initialize Cassandra client
      this.client = new Client({
        contactPoints: ['127.0.0.1'],
        localDataCenter: 'datacenter1',
        keyspace: 'my_keyspace',
      });

      await this.client.connect();
      this.logger.log('Successfully connected to Cassandra');

      // Create table if it doesn't exist
      await this.createTables();
    } catch (error) {
      this.logger.error('Failed to connect to Cassandra', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.shutdown();
      this.logger.log('Cassandra connection closed');
    }
  }

  private async createTables() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS processed_data (
        id UUID PRIMARY KEY,
        name TEXT,
        email TEXT,
        age INT,
        processed_by TEXT,
        enriched_info TEXT,
        timestamp TIMESTAMP,
        processing_timestamp TIMESTAMP
      )
    `;

    try {
      await this.client.execute(createTableQuery);
      this.logger.log('Table "processed_data" created or already exists');
    } catch (error) {
      this.logger.error('Error creating table', error);
      throw error;
    }
  }

  async saveProcessedData(data: ProcessedData): Promise<string> {
    const id = this.generateUUID();
    
    const query = `
      INSERT INTO processed_data (id, name, email, age, processed_by, enriched_info, timestamp, processing_timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      data.name,
      data.email,
      data.age,
      data.processedBy,
      data.enrichedInfo,
      data.timestamp || new Date(),
      data.processingTimestamp,
    ];

    try {
      await this.client.execute(query, params);
      this.logger.log(`Data saved with ID: ${id}`);
      return id;
    } catch (error) {
      this.logger.error('Error saving data to Cassandra', error);
      throw error;
    }
  }

  async getProcessedData(id: string): Promise<ProcessedData | null> {
    const query = 'SELECT * FROM processed_data WHERE id = ?';

    try {
      const result = await this.client.execute(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        age: row.age,
        processedBy: row.processed_by,
        enrichedInfo: row.enriched_info,
        timestamp: row.timestamp,
        processingTimestamp: row.processing_timestamp,
      };
    } catch (error) {
      this.logger.error('Error retrieving data from Cassandra', error);
      throw error;
    }
  }

  async getAllProcessedData(): Promise<ProcessedData[]> {
    const query = 'SELECT * FROM processed_data';

    try {
      const result = await this.client.execute(query);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        age: row.age,
        processedBy: row.processed_by,
        enrichedInfo: row.enriched_info,
        timestamp: row.timestamp,
        processingTimestamp: row.processing_timestamp,
      }));
    } catch (error) {
      this.logger.error('Error retrieving all data from Cassandra', error);
      throw error;
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
