import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return system operational status', () => {
      const status = appController.getSystemStatus();
      expect(status).toHaveProperty('status', 'operational');
      expect(status).toHaveProperty('name', 'AtoZ Scalable E-Commerce API');
      expect(status).toHaveProperty('version', '1.0.0');
    });
  });
});
