import { Test, TestingModule } from '@nestjs/testing';
import { DataProcessorController } from './data-processor.controller';
import { DataProcessorService } from './data-processor.service';

describe('DataProcessorController', () => {
  let dataProcessorController: DataProcessorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DataProcessorController],
      providers: [DataProcessorService],
    }).compile();

    dataProcessorController = app.get<DataProcessorController>(DataProcessorController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(dataProcessorController.getHello()).toBe('Hello World!');
    });
  });
});
