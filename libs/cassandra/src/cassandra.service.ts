import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Client, types } from 'cassandra-driver';
import { v4 as uuidv4 } from 'uuid';

// Internal interface for Cassandra operations (uses Date objects)
interface CassandraProcessedData {
  id?: string;
  name: string;
  email: string;
  age: number;
  processedBy: string;
  enrichedInfo: string;
  timestamp: Date | string;
  processingTimestamp: Date | string;
}

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

  async saveProcessedData(data: CassandraProcessedData): Promise<string> {
    const id = uuidv4();

    const query = `
      INSERT INTO processed_data (id, name, email, age, processed_by, enriched_info, timestamp, processing_timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      // Ensure age is an integer
      const age = parseInt(data.age.toString(), 10);

      // Ensure timestamps are Date objects
      const timestamp =
        data.timestamp instanceof Date
          ? data.timestamp
          : new Date(data.timestamp || Date.now());
      const processingTimestamp =
        data.processingTimestamp instanceof Date
          ? data.processingTimestamp
          : new Date(data.processingTimestamp || Date.now());

      // Ensure age is a proper 32-bit integer for Cassandra
      const cassandraAge = Math.floor(Number(age));

      // Validate age is within 32-bit integer range
      if (cassandraAge < -2147483648 || cassandraAge > 2147483647) {
        throw new Error(`Age ${cassandraAge} is out of 32-bit integer range`);
      }

      const params = [
        types.Uuid.fromString(id),
        String(data.name),
        String(data.email),
        cassandraAge,
        String(data.processedBy),
        String(data.enrichedInfo),
        timestamp,
        processingTimestamp,
      ];

      // Execute with prepared statement and explicit type hints
      const queryOptions = {
        prepare: true,
        hints: [
          'uuid', // id
          'text', // name
          'text', // email
          'int', // age - explicitly specify as 32-bit int
          'text', // processed_by
          'text', // enriched_info
          'timestamp', // timestamp
          'timestamp', // processing_timestamp
        ],
      };

      await this.client.execute(query, params, queryOptions);
      this.logger.log(`Data saved successfully with ID: ${id}`);
      return id;
    } catch (error) {
      this.logger.error(
        `Error saving data to Cassandra: ${error.message}`,
        error.stack,
      );
      this.logger.error(`Data that failed to save: ${JSON.stringify(data)}`);
      throw new Error(`Failed to save to database: ${error.message}`);
    }
  }

  async getProcessedData(id: string): Promise<CassandraProcessedData | null> {
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

  async getAllProcessedData(): Promise<CassandraProcessedData[]> {
    const query = 'SELECT * FROM processed_data';

    try {
      const result = await this.client.execute(query);

      if (result.rows.length === 0) {
        return [];
      }

      const mappedData = result.rows.map((row) => ({
        id: row.id?.toString() || '',
        name: row.name || '',
        email: row.email || '',
        age: row.age || 0,
        processedBy: row.processed_by || '',
        enrichedInfo: row.enriched_info || '',
        timestamp: row.timestamp || new Date(),
        processingTimestamp: row.processing_timestamp || new Date(),
      }));
      return mappedData;
    } catch (error) {
      this.logger.error(
        `Error retrieving all data from Cassandra: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
