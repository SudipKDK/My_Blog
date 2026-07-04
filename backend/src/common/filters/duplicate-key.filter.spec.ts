import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DuplicateKeyFilter } from './duplicate-key.filter';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds a minimal ArgumentsHost mock and also returns the underlying
 * jest.fn() references so tests can assert on them without touching
 * the ArgumentsHost type directly.
 */
function makeHost(url = '/posts') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status };
  const request = { url };
  const ctx = { getResponse: () => response, getRequest: () => request };
  const host = { switchToHttp: () => ctx } as unknown as ArgumentsHost;

  // Return mocks separately — ArgumentsHost has no .json / .status
  return { host, json, status };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DuplicateKeyFilter', () => {
  let filter: DuplicateKeyFilter;

  beforeEach(() => {
    filter = new DuplicateKeyFilter();
  });

  it('returns 409 Conflict when a MongoDB E11000 duplicate key error is caught', () => {
    const exception = { code: 11000, keyPattern: { slug: 1 } };
    const { host, status } = makeHost('/posts');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('includes the duplicate field name in the error message', () => {
    const exception = { code: 11000, keyPattern: { slug: 1 } };
    const { host, json } = makeHost('/posts');

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('slug'),
      }),
    );
  });

  it('includes the request path in the response', () => {
    const exception = { code: 11000, keyPattern: { slug: 1 } };
    const { host, json } = makeHost('/api/posts');

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/api/posts' }),
    );
  });

  it('response body contains statusCode and timestamp', () => {
    const exception = { code: 11000, keyPattern: { email: 1 } };
    const { host, json } = makeHost();

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        timestamp: expect.any(String),
      }),
    );
  });

  it('re-throws non-duplicate-key exceptions', () => {
    const exception = { code: 500, message: 'Something else' };
    const { host } = makeHost();

    expect(() => filter.catch(exception, host)).toThrow();
  });

  it('re-throws exceptions with no code property', () => {
    const exception = new Error('random error');
    const { host } = makeHost();

    expect(() => filter.catch(exception as any, host)).toThrow('random error');
  });

  it('falls back to "field" when keyPattern is empty', () => {
    const exception = { code: 11000, keyPattern: {} };
    const { host, json } = makeHost();

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('field'),
      }),
    );
  });
});
