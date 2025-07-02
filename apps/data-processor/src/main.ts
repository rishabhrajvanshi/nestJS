import { NestFactory } from '@nestjs/core';
import { DataProcessorModule } from './data-processor.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('DataProcessor');

  // Create gRPC microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
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

  await app.listen();
  logger.log('🚀 Data Processor gRPC server is running on localhost:50051');

  // Also create HTTP server for health checks (optional)
  const httpApp = await NestFactory.create(DataProcessorModule);
  const httpPort = process.env.HTTP_PORT || 3002;
  await httpApp.listen(httpPort);
  logger.log(`📡 Data Processor HTTP server is running on http://localhost:${httpPort}`);
}
bootstrap();
