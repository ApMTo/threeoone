import { ServiceUnavailableException } from '@nestjs/common';
import Redis from 'ioredis';

export class RedisService {
  private readonly client: Redis;

  constructor(host: string, port: number) {
    this.client = new Redis({
      host,
      port,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    // Prevent ioredis from crashing the process with unhandled 'error' events.
    this.client.on('error', () => undefined);
  }

  private async ensureConnected(): Promise<void> {
    try {
      if (this.client.status === 'wait' || this.client.status === 'end') {
        await this.client.connect();
      }

      if (this.client.status !== 'ready') {
        await this.client.ping();
      }
    } catch {
      throw new ServiceUnavailableException(
        'Redis is unavailable. Start it with: docker compose up -d redis',
      );
    }
  }

  async get(key: string): Promise<string | null> {
    await this.ensureConnected();
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.ensureConnected();
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.ensureConnected();
    await this.client.del(key);
  }

  async quit(): Promise<void> {
    if (this.client.status === 'end' || this.client.status === 'close') {
      return;
    }

    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}
