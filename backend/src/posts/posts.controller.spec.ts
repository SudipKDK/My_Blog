import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Mock PostsService ────────────────────────────────────────────────────────

const mockPost = (overrides = {}) => ({
  _id: 'post-id-123',
  title: 'Test Post',
  slug: 'test-post-abc1',
  content: 'Hello World',
  published: false,
  ...overrides,
});

const mockPaginatedResult = (data: any[] = [], total = 0) => ({
  data,
  total,
  page: 1,
  limit: 10,
});

const mockPostsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllPublished: jest.fn(),
  findOneById: jest.fn(),
  findOneBySlug: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockPostsService }],
    })
      // Override JwtAuthGuard so unit tests don't need a real JWT
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostsController>(PostsController);
    jest.clearAllMocks();
  });

  // ─── POST /posts ──────────────────────────────────────────────────────────

  describe('create()', () => {
    it('calls postsService.create with the DTO and returns the result', async () => {
      const dto = { title: 'New', slug: 'new-post', content: 'body' };
      const created = mockPost(dto);
      mockPostsService.create.mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(mockPostsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  // ─── GET /posts ───────────────────────────────────────────────────────────

  describe('findAllPublished()', () => {
    it('calls findAllPublished with default page=1 and limit=10 when no query params', async () => {
      mockPostsService.findAllPublished.mockResolvedValue(mockPaginatedResult());

      await controller.findAllPublished(undefined, undefined);

      expect(mockPostsService.findAllPublished).toHaveBeenCalledWith(1, 10);
    });

    it('passes parsed page and limit query params to the service', async () => {
      mockPostsService.findAllPublished.mockResolvedValue(mockPaginatedResult());

      await controller.findAllPublished('2', '5');

      expect(mockPostsService.findAllPublished).toHaveBeenCalledWith(2, 5);
    });

    it('returns the paginated response from the service', async () => {
      const posts = [mockPost()];
      const paginated = mockPaginatedResult(posts, 1);
      mockPostsService.findAllPublished.mockResolvedValue(paginated);

      const result = await controller.findAllPublished(undefined, undefined);

      expect(result).toEqual(paginated);
    });
  });

  // ─── GET /posts/admin ─────────────────────────────────────────────────────

  describe('findAll() (admin)', () => {
    it('calls postsService.findAll with correct page and limit', async () => {
      mockPostsService.findAll.mockResolvedValue(mockPaginatedResult());

      await controller.findAll('3', '20');

      expect(mockPostsService.findAll).toHaveBeenCalledWith(3, 20);
    });

    it('defaults to page=1, limit=10 when no params provided', async () => {
      mockPostsService.findAll.mockResolvedValue(mockPaginatedResult());

      await controller.findAll(undefined, undefined);

      expect(mockPostsService.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  // ─── GET /posts/admin/:id ─────────────────────────────────────────────────

  describe('findOneAdmin()', () => {
    it('calls postsService.findOneById with the route param', async () => {
      const post = mockPost();
      mockPostsService.findOneById.mockResolvedValue(post);

      const result = await controller.findOneAdmin('post-id-123');

      expect(mockPostsService.findOneById).toHaveBeenCalledWith('post-id-123');
      expect(result).toEqual(post);
    });

    it('propagates NotFoundException when service throws', async () => {
      mockPostsService.findOneById.mockRejectedValue(new NotFoundException('Post not found'));

      await expect(controller.findOneAdmin('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── GET /posts/:slug ─────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('calls postsService.findOneBySlug with the slug param', async () => {
      const post = mockPost();
      mockPostsService.findOneBySlug.mockResolvedValue(post);

      const result = await controller.findOne('test-post-abc1');

      expect(mockPostsService.findOneBySlug).toHaveBeenCalledWith('test-post-abc1');
      expect(result).toEqual(post);
    });

    it('propagates NotFoundException for unknown slug', async () => {
      mockPostsService.findOneBySlug.mockRejectedValue(new NotFoundException('Post not found'));

      await expect(controller.findOne('no-such-post')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── PATCH /posts/:id ────────────────────────────────────────────────────

  describe('update()', () => {
    it('calls postsService.update with id and DTO, returns result', async () => {
      const updated = mockPost({ title: 'Updated' });
      mockPostsService.update.mockResolvedValue(updated);

      const result = await controller.update('post-id-123', { title: 'Updated' } as any);

      expect(mockPostsService.update).toHaveBeenCalledWith('post-id-123', { title: 'Updated' });
      expect(result).toEqual(updated);
    });

    it('propagates NotFoundException when service throws', async () => {
      mockPostsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('bad-id', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── DELETE /posts/:id ───────────────────────────────────────────────────

  describe('remove()', () => {
    it('calls postsService.remove with the id param', async () => {
      const post = mockPost();
      mockPostsService.remove.mockResolvedValue(post);

      const result = await controller.remove('post-id-123');

      expect(mockPostsService.remove).toHaveBeenCalledWith('post-id-123');
      expect(result).toEqual(post);
    });

    it('propagates NotFoundException for a non-existent id', async () => {
      mockPostsService.remove.mockRejectedValue(new NotFoundException('Post not found'));

      await expect(controller.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
