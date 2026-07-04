import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

describe('AppController', () => {
  let appController: AppController;

  const mockHealth = { check: jest.fn().mockResolvedValue({ status: 'ok' }) };
  const mockMongoose = { pingCheck: jest.fn().mockResolvedValue({ mongodb: { status: 'up' } }) };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealth },
        { provide: MongooseHealthIndicator, useValue: mockMongoose },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    jest.clearAllMocks();
  });

  describe('check()', () => {
    it('calls health.check and returns the result', async () => {
      const result = await appController.check();
      expect(mockHealth.check).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ status: 'ok' });
    });
  });
});
