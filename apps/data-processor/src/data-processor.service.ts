import { Injectable } from '@nestjs/common';

@Injectable()
export class DataProcessorService {
  getHello(): string {
    return 'Hello World!';
  }
}
