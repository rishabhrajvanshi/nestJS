import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DATA_PROCESSING_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'dataprocessing',
          protoPath: join(process.cwd(), 'proto/data-processing.proto'),
          url: 'localhost:50051',
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
