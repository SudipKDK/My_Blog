import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';

async function validateDto(plain: object) {
  const dto = plainToInstance(LoginDto, plain);
  return validate(dto);
}

describe('LoginDto', () => {

  it('passes with valid username and password', async () => {
    const errors = await validateDto({ username: 'admin', password: 'secret' });
    expect(errors).toHaveLength(0);
  });

  it('fails when username is missing', async () => {
    const errors = await validateDto({ password: 'secret' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('username');
  });

  it('fails when password is missing', async () => {
    const errors = await validateDto({ username: 'admin' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('password');
  });

  it('fails when username is an empty string', async () => {
    const errors = await validateDto({ username: '', password: 'secret' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('username');
  });

  it('fails when password is an empty string', async () => {
    const errors = await validateDto({ username: 'admin', password: '' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('password');
  });

  it('fails when username is not a string', async () => {
    const errors = await validateDto({ username: 123 as any, password: 'secret' });
    const props = errors.map((e) => e.property);
    expect(props).toContain('username');
  });

  it('fails when password is not a string', async () => {
    const errors = await validateDto({ username: 'admin', password: null as any });
    const props = errors.map((e) => e.property);
    expect(props).toContain('password');
  });
});
