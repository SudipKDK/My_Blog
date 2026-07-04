import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

// ─── Mock bcrypt at module level (avoids "cannot redefine property" error) ────
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

// ─── Mock factory ─────────────────────────────────────────────────────────────

const mockUserModel = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
});

const ENV: Record<string, string> = {
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'adminpass',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UsersService', () => {
  let service: UsersService;
  let model: ReturnType<typeof mockUserModel>;

  beforeEach(async () => {
    jest.clearAllMocks();
    model = mockUserModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: model },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => ENV[key]) },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // ─── findByUsername ───────────────────────────────────────────────────────

  describe('findByUsername()', () => {
    it('returns the user document when username exists', async () => {
      const user = { _id: 'u1', username: 'admin', password: 'hashed' };
      (model.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

      const result = await service.findByUsername('admin');

      expect(result).toEqual(user);
      expect(model.findOne).toHaveBeenCalledWith({ username: 'admin' });
    });

    it('returns null when username does not exist', async () => {
      (model.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.findByUsername('nobody');

      expect(result).toBeNull();
    });
  });

  // ─── onModuleInit (seeding) ───────────────────────────────────────────────

  describe('onModuleInit()', () => {
    it('seeds admin user when DB is empty and env vars are set', async () => {
      (model.countDocuments as jest.Mock).mockResolvedValue(0);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');

      await service.onModuleInit();

      expect(model.create).toHaveBeenCalledWith({
        username: 'admin',
        password: 'hashed-pass',
      });
    });

    it('does NOT seed when users already exist', async () => {
      (model.countDocuments as jest.Mock).mockResolvedValue(1);

      await service.onModuleInit();

      expect(model.create).not.toHaveBeenCalled();
    });

    it('does NOT seed when ADMIN_USERNAME env var is missing', async () => {
      (model.countDocuments as jest.Mock).mockResolvedValue(0);
      const module = await Test.createTestingModule({
        providers: [
          UsersService,
          { provide: getModelToken(User.name), useValue: model },
          {
            provide: ConfigService,
            useValue: { get: jest.fn().mockReturnValue(undefined) },
          },
        ],
      }).compile();
      const svc = module.get<UsersService>(UsersService);

      await svc.onModuleInit();

      expect(model.create).not.toHaveBeenCalled();
    });

    it('hashes the password with bcrypt salt rounds 10 before saving', async () => {
      (model.countDocuments as jest.Mock).mockResolvedValue(0);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');

      await service.onModuleInit();

      expect(bcrypt.hash).toHaveBeenCalledWith('adminpass', 10);
    });
  });
});
