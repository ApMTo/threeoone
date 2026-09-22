import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AppConfigService } from '../../config/config.service';
import { RedisService } from '../../redis/redis.service';
import {
  PENDING_REGISTRATION_TTL_SECONDS,
  pendingEmailKey,
  pendingRegistrationKey,
  type PendingRegistration,
} from './auth.constants';

@Injectable()
export class PendingRegistrationService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  createToken(): string {
    return randomBytes(32).toString('hex');
  }

  async save(token: string, payload: PendingRegistration): Promise<void> {
    const existingToken = await this.redis.get(pendingEmailKey(payload.email));
    if (existingToken) {
      await this.redis.del(pendingRegistrationKey(existingToken));
    }

    await this.redis.set(
      pendingRegistrationKey(token),
      JSON.stringify(payload),
      PENDING_REGISTRATION_TTL_SECONDS,
    );
    await this.redis.set(
      pendingEmailKey(payload.email),
      token,
      PENDING_REGISTRATION_TTL_SECONDS,
    );
  }

  async get(token: string): Promise<PendingRegistration | null> {
    const raw = await this.redis.get(pendingRegistrationKey(token));
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as PendingRegistration;
    } catch {
      return null;
    }
  }

  async remove(token: string, email: string): Promise<void> {
    await this.redis.del(pendingRegistrationKey(token));
    await this.redis.del(pendingEmailKey(email));
  }

  buildConfirmUrl(token: string): string {
    const url = new URL('/verify-email', this.config.frontendUrl);
    url.searchParams.set('token', token);
    return url.toString();
  }
}
