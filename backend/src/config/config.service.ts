import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, NodeEnv } from './env.validation';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {}

  get nodeEnv(): NodeEnv {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL', { infer: true });
  }

  get redisHost(): string {
    return this.configService.get('REDIS_HOST', { infer: true });
  }

  get redisPort(): number {
    return this.configService.get('REDIS_PORT', { infer: true });
  }

  get jwtAccessSecret(): string {
    return this.configService.get('JWT_ACCESS_SECRET', { infer: true });
  }

  get jwtAccessExpiresIn(): string {
    return this.configService.get('JWT_ACCESS_EXPIRES_IN', { infer: true });
  }

  get jwtRefreshExpiresInSeconds(): number {
    return this.configService.get('JWT_REFRESH_EXPIRES_IN_SECONDS', { infer: true });
  }

  get frontendUrl(): string {
    return this.configService.get('FRONTEND_URL', { infer: true });
  }

  get cookieDomain(): string | undefined {
    return this.configService.get('COOKIE_DOMAIN', { infer: true });
  }

  get smtpHost(): string {
    return this.configService.get('SMTP_HOST', { infer: true });
  }

  get smtpPort(): number {
    return this.configService.get('SMTP_PORT', { infer: true });
  }

  get smtpUser(): string {
    return this.configService.get('SMTP_USER', { infer: true });
  }

  get smtpPass(): string {
    return this.configService.get('SMTP_PASS', { infer: true });
  }

  get smtpFrom(): string {
    return this.configService.get('SMTP_FROM', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === NodeEnv.Production;
  }
}
