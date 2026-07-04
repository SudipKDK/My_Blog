import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  // ─── POST /auth/login ─────────────────────────────────────────────────────

  describe('login()', () => {
    it('calls authService.login with the provided DTO', async () => {
      const dto = { username: 'admin', password: 'secret' };
      authService.login.mockResolvedValue({ access_token: 'tok' });

      await controller.login(dto as any);

      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('returns the access_token from the service', async () => {
      const dto = { username: 'admin', password: 'secret' };
      authService.login.mockResolvedValue({ access_token: 'signed.token' });

      const result = await controller.login(dto as any);

      expect(result).toEqual({ access_token: 'signed.token' });
    });

    it('propagates UnauthorizedException when credentials are invalid', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(
        controller.login({ username: 'x', password: 'wrong' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
