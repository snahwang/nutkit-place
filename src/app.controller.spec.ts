import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should return index page data', () => {
    const result = controller.getIndex();
    expect(result).toHaveProperty('title', 'Zarket Places');
    expect(result).toHaveProperty('items');
  });
});
