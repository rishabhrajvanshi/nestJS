import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Enable CORS for development
  app.enableCors();

  const port = process.env.PORT || 3001;
  await app.listen(port);

  Logger.log(
    `🚀 API Gateway is running on http://localhost:${port}`,
    'Bootstrap',
  );
}
bootstrap();
