import { NestFactory } from '@nestjs/core';
import { DataProcessorModule } from './data-processor.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('DataProcessor');

  // Create HTTP application first
  const httpApp = await NestFactory.create(DataProcessorModule);
  await httpApp.listen(3002);
  logger.log(
    '🌐 Data Processor HTTP server is running on http://localhost:3002',
  );

  // Create gRPC microservice
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    DataProcessorModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'dataprocessing',
        protoPath: join(process.cwd(), 'proto/data-processing.proto'),
        url: 'localhost:50051',
      },
    },
  );

  await grpcApp.listen();
  logger.log('🚀 Data Processor gRPC server is running on localhost:50051');
  logger.log('🔍 Listening for ProcessUserData method calls...');
  logger.log('📋 Ready to receive both HTTP and gRPC requests!');
}
bootstrap();
