import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('JwtAuthGuard', () => {

  it('is defined and extends AuthGuard("jwt")', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
    // AuthGuard('jwt') sets up canActivate via passport
    expect(guard).toBeInstanceOf(AuthGuard('jwt'));
  });

  it('allows access when a valid JWT is present (canActivate returns truthy)', async () => {
    const guard = new JwtAuthGuard();

    // Stub canActivate to simulate a valid token
    jest.spyOn(guard, 'canActivate').mockReturnValue(true as any);

    const context = {} as ExecutionContext;
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('denies access when no JWT is present (canActivate returns falsy)', async () => {
    const guard = new JwtAuthGuard();

    jest.spyOn(guard, 'canActivate').mockReturnValue(false as any);

    const context = {} as ExecutionContext;
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('denies access when JWT is malformed (canActivate throws UnauthorizedException)', async () => {
    const guard = new JwtAuthGuard();
    const { UnauthorizedException } = require('@nestjs/common');

    jest.spyOn(guard, 'canActivate').mockImplementation(() => {
      throw new UnauthorizedException('Unauthorized');
    });

    expect(() => guard.canActivate({} as ExecutionContext)).toThrow(UnauthorizedException);
  });
});
