import { Module } from '@nestjs/common';
import { DataProcessorController } from './data-processor.controller';
import { DataProcessorService } from './data-processor.service';
import { CassandraModule } from 'wp/cassandra';

@Module({
  imports: [CassandraModule],
  controllers: [DataProcessorController],
  providers: [DataProcessorService],
})
export class DataProcessorModule {}
