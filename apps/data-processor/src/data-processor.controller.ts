import { Controller, Get } from '@nestjs/common';
import { DataProcessorService } from './data-processor.service';

@Controller()
export class DataProcessorController {
  constructor(private readonly dataProcessorService: DataProcessorService) {}

  @Get()
  getHello(): string {
    return this.dataProcessorService.getHello();
  }
}
