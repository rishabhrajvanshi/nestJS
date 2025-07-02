import { NestFactory } from '@nestjs/core';
import { DataProcessorModule } from './data-processor.module';

async function bootstrap() {
  const app = await NestFactory.create(DataProcessorModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
