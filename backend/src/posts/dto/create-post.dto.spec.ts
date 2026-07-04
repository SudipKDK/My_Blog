import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePostDto } from './create-post.dto';

// ─── Helper ───────────────────────────────────────────────────────────────────

async function validateDto(plain: object) {
  const dto = plainToInstance(CreatePostDto, plain);
  return validate(dto);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreatePostDto', () => {

  // ─── Valid DTO ─────────────────────────────────────────────────────────────

  it('passes validation with all valid required fields', async () => {
    const errors = await validateDto({
      title: 'My Post',
      slug: 'my-post',
      content: 'Some content here',
    });
    expect(errors).toHaveLength(0);
  });

  it('passes validation with optional fields included', async () => {
    const errors = await validateDto({
      title: 'My Post',
      slug: 'my-post',
      content: 'Some content here',
      coverImage: 'https://example.com/img.png',
      published: true,
    });
    expect(errors).toHaveLength(0);
  });

  // ─── Missing required fields ───────────────────────────────────────────────

  it('fails when title is missing', async () => {
    const errors = await validateDto({ slug: 'my-post', content: 'body' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('title');
  });

  it('fails when slug is missing', async () => {
    const errors = await validateDto({ title: 'Title', content: 'body' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('slug');
  });

  it('fails when content is missing', async () => {
    const errors = await validateDto({ title: 'Title', slug: 'my-post' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('content');
  });

  // ─── Empty string fields ───────────────────────────────────────────────────

  it('fails when title is an empty string', async () => {
    const errors = await validateDto({ title: '', slug: 'my-post', content: 'body' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('title');
  });

  it('fails when slug is an empty string', async () => {
    const errors = await validateDto({ title: 'Title', slug: '', content: 'body' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('slug');
  });

  // ─── Slug format validation (@Matches) ────────────────────────────────────

  it('fails when slug contains uppercase letters', async () => {
    const errors = await validateDto({ title: 'T', slug: 'My-Post', content: 'body' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('slug');
  });

  it('fails when slug contains spaces', async () => {
    const errors = await validateDto({ title: 'T', slug: 'my post', content: 'body' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('slug');
  });

  it('fails when slug contains special characters', async () => {
    const errors = await validateDto({ title: 'T', slug: 'my_post!', content: 'body' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('slug');
  });

  it('passes when slug contains only lowercase, numbers, and hyphens', async () => {
    const errors = await validateDto({ title: 'T', slug: 'my-post-123', content: 'body' });
    expect(errors).toHaveLength(0);
  });

  // ─── Wrong data types ──────────────────────────────────────────────────────

  it('fails when published is a string instead of boolean', async () => {
    const errors = await validateDto({
      title: 'T',
      slug: 'my-post',
      content: 'body',
      published: 'yes' as any,
    });
    const props = errors.map((e) => e.property);
    expect(props).toContain('published');
  });

  // ─── Optional fields absent = OK ──────────────────────────────────────────

  it('passes when coverImage is omitted', async () => {
    const errors = await validateDto({ title: 'T', slug: 'my-post', content: 'body' });
    expect(errors).toHaveLength(0);
  });

  it('passes when published is omitted', async () => {
    const errors = await validateDto({ title: 'T', slug: 'my-post', content: 'body' });
    expect(errors).toHaveLength(0);
  });
});
