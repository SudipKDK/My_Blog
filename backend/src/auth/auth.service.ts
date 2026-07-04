import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

// Pre-hashed dummy password used to prevent timing attacks when a user is not found.
// We always run bcrypt.compare even for non-existent users so the response time is consistent.
const DUMMY_HASH = '$2b$10$dummyHashForTimingAttackPreventionXXXXXXXXXXXXXXXXXXXX';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);

    // Always run bcrypt.compare to prevent timing-based username enumeration.
    const passwordToCompare = user?.password ?? DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(loginDto.password, passwordToCompare);

    if (user && isPasswordValid) {
      const payload = { username: user.username, sub: user._id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
