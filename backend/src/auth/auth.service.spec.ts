import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// ─── Mock bcrypt at module level (avoids "cannot redefine property" error) ────
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeUser = (overrides = {}) => ({
  _id: 'user-id-1',
  username: 'admin',
  password: '$2b$10$hashedpassword',
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findByUsername: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed.jwt.token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  // ─── Successful login ─────────────────────────────────────────────────────

  describe('login() — success', () => {
    it('returns an access_token when credentials are valid', async () => {
      const user = makeUser();
      usersService.findByUsername.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ username: 'admin', password: 'secret' });

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('signed.jwt.token');
    });

    it('signs the JWT with username and sub from the user', async () => {
      const user = makeUser();
      usersService.findByUsername.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login({ username: 'admin', password: 'secret' });

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user._id,
      });
    });
  });

  // ─── Wrong password ───────────────────────────────────────────────────────

  describe('login() — wrong password', () => {
    it('throws UnauthorizedException when password is incorrect', async () => {
      const user = makeUser();
      usersService.findByUsername.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'admin', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns "Invalid credentials" message on wrong password', async () => {
      const user = makeUser();
      usersService.findByUsername.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'admin', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  // ─── Non-existent user ────────────────────────────────────────────────────

  describe('login() — non-existent user', () => {
    it('throws UnauthorizedException when user is not found', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'nobody', password: 'anything' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('still calls bcrypt.compare even when user is not found (timing attack prevention)', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'nobody', password: 'anything' }),
      ).rejects.toThrow(UnauthorizedException);

      // Must be called once — with the DUMMY_HASH, not a real password hash
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });
});
