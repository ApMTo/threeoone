import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AppConfigService } from '../../config/config.service';
import { RedisService } from '../../redis/redis.service';
import {
  PASSWORD_RESET_TTL_SECONDS,
  passwordResetEmailKey,
  passwordResetKey,
} from './auth.constants';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  createToken(): string {
    return randomBytes(32).toString('hex');
  }

  async save(token: string, email: string): Promise<void> {
    const normalized = email.toLowerCase().trim();
    const existingToken = await this.redis.get(passwordResetEmailKey(normalized));
    if (existingToken) {
      await this.redis.del(passwordResetKey(existingToken));
    }

    await this.redis.set(passwordResetKey(token), normalized, PASSWORD_RESET_TTL_SECONDS);
    await this.redis.set(
      passwordResetEmailKey(normalized),
      token,
      PASSWORD_RESET_TTL_SECONDS,
    );
  }

  async getEmail(token: string): Promise<string | null> {
    return this.redis.get(passwordResetKey(token));
  }

  async remove(token: string, email: string): Promise<void> {
    await this.redis.del(passwordResetKey(token));
    await this.redis.del(passwordResetEmailKey(email));
  }

  buildResetUrl(token: string): string {
    const url = new URL('/reset-password', this.config.frontendUrl);
    url.searchParams.set('token', token);
    return url.toString();
  }
}
