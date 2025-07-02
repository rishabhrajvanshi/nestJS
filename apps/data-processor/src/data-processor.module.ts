import { Module } from '@nestjs/common';
import { DataProcessorController } from './data-processor.controller';
import { DataProcessorService } from './data-processor.service';

@Module({
  imports: [],
  controllers: [DataProcessorController],
  providers: [DataProcessorService],
})
export class DataProcessorModule {}
