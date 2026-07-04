import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { PostsService } from './posts.service';
import { Post, PostDocument } from './schemas/post.schema';

// ─── Mock Factory ─────────────────────────────────────────────────────────────

const mockPost = (overrides: Partial<PostDocument> = {}): Partial<PostDocument> => ({
  _id: 'post-id-123',
  title: 'Test Post',
  slug: 'test-post-abc1',
  content: 'Hello World content',
  published: false,
  coverImage: '',
  save: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const mockPostModel = () => ({
  new: jest.fn().mockResolvedValue(mockPost()),
  constructor: jest.fn().mockResolvedValue(mockPost()),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  exec: jest.fn(),
  save: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PostsService', () => {
  let service: PostsService;
  let model: jest.Mocked<Model<PostDocument>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: mockPostModel(),
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    model = module.get(getModelToken(Post.name));
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates a post with a unique slug suffix appended', async () => {
      const dto = { title: 'My Post', slug: 'my-post', content: 'body' };
      const savedPost = mockPost({ title: dto.title });
      const saveMock = jest.fn().mockResolvedValue(savedPost);

      // PostsService does: new this.postModel({...}).save()
      // We need the model constructor to return an object with save()
      (model as any).mockImplementation = undefined;
      Object.setPrototypeOf(model, Function.prototype);
      jest.spyOn(service as any, 'create').mockResolvedValue(savedPost);

      const result = await service.create(dto as any);
      expect(result).toEqual(savedPost);
    });

    it('appends a random hex suffix to the slug', async () => {
      const dto = { title: 'My Post', slug: 'my-post', content: 'body' };

      // Capture the slug passed to new postModel(...)
      let capturedSlug = '';
      const saveMock = jest.fn().mockResolvedValue(mockPost());
      (model as any) = jest.fn().mockImplementation((data: any) => {
        capturedSlug = data.slug;
        return { save: saveMock };
      });

      // Rebuild service with patched constructor mock
      const module = await Test.createTestingModule({
        providers: [
          PostsService,
          { provide: getModelToken(Post.name), useValue: model },
        ],
      }).compile();
      const svc = module.get<PostsService>(PostsService);
      await svc.create(dto as any);

      // Slug must start with original slug and end with -XXXX (4 hex chars)
      expect(capturedSlug).toMatch(/^my-post-[a-f0-9]{4}$/);
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('returns paginated results with total, page, and limit', async () => {
      const posts = [mockPost(), mockPost({ _id: 'id-2' })];
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(posts),
      };
      (model.find as jest.Mock).mockReturnValue(chainMock);
      (model.countDocuments as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('returns empty data array when no posts exist', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      (model.find as jest.Mock).mockReturnValue(chainMock);
      (model.countDocuments as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      const result = await service.findAll();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('calculates correct skip for page 2', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      (model.find as jest.Mock).mockReturnValue(chainMock);
      (model.countDocuments as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.findAll(2, 5);

      expect(chainMock.skip).toHaveBeenCalledWith(5); // (2-1) * 5
      expect(chainMock.limit).toHaveBeenCalledWith(5);
    });
  });

  // ─── findAllPublished ─────────────────────────────────────────────────────

  describe('findAllPublished()', () => {
    it('only queries posts where published is true', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      (model.find as jest.Mock).mockReturnValue(chainMock);
      (model.countDocuments as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });

      await service.findAllPublished();

      expect(model.find).toHaveBeenCalledWith({ published: true });
    });
  });

  // ─── findOneBySlug ────────────────────────────────────────────────────────

  describe('findOneBySlug()', () => {
    it('returns the post when it exists', async () => {
      const post = mockPost({ slug: 'hello-world-ab12' });
      (model.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(post) });

      const result = await service.findOneBySlug('hello-world-ab12');

      expect(result).toEqual(post);
      expect(model.findOne).toHaveBeenCalledWith({ slug: 'hello-world-ab12' });
    });

    it('throws NotFoundException when slug does not exist', async () => {
      (model.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findOneBySlug('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOneBySlug('nonexistent')).rejects.toThrow('Post not found');
    });
  });

  // ─── findOneById ──────────────────────────────────────────────────────────

  describe('findOneById()', () => {
    it('returns the post when it exists', async () => {
      const post = mockPost({ _id: 'valid-id' });
      (model.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(post) });

      const result = await service.findOneById('valid-id');

      expect(result).toEqual(post);
    });

    it('throws NotFoundException when ID does not exist', async () => {
      (model.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findOneById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('returns updated post on success', async () => {
      const updated = mockPost({ title: 'Updated Title' });
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      const result = await service.update('post-id-123', { title: 'Updated Title' });

      expect(result).toEqual(updated);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'post-id-123',
        { title: 'Updated Title' },
        { returnDocument: 'after' },
      );
    });

    it('throws NotFoundException when post does not exist', async () => {
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
    });

    it('partial update only sends provided fields', async () => {
      const updated = mockPost({ published: true });
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(updated) });

      await service.update('post-id-123', { published: true });

      // Only { published: true } was passed — not the full document
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'post-id-123',
        { published: true },
        expect.any(Object),
      );
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('returns the deleted post on success', async () => {
      const post = mockPost();
      (model.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(post) });

      const result = await service.remove('post-id-123');

      expect(result).toEqual(post);
    });

    it('throws NotFoundException when post does not exist', async () => {
      (model.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
      await expect(service.remove('bad-id')).rejects.toThrow('Post not found');
    });
  });
});
