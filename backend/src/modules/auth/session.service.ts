import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { AppConfigService } from '../../config/config.service';
import { RedisService } from '../../redis/redis.service';
import { SessionRecord, sessionKey } from './auth.constants';

@Injectable()
export class SessionService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  createIds(): { sessionId: string; refreshToken: string; csrfToken: string } {
    return {
      sessionId: uuidv4(),
      refreshToken: randomBytes(48).toString('hex'),
      csrfToken: randomBytes(32).toString('hex'),
    };
  }

  hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  async save(sessionId: string, record: SessionRecord): Promise<void> {
    await this.redis.set(
      sessionKey(sessionId),
      JSON.stringify(record),
      this.config.jwtRefreshExpiresInSeconds,
    );
  }

  async get(sessionId: string): Promise<SessionRecord | null> {
    const raw = await this.redis.get(sessionKey(sessionId));
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SessionRecord;
    } catch {
      return null;
    }
  }

  async remove(sessionId: string): Promise<void> {
    await this.redis.del(sessionKey(sessionId));
  }
}
