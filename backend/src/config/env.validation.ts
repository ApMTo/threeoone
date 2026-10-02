import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV!: NodeEnv;

  @IsInt()
  @Min(3000)
  @Max(9999)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  @IsUrl({
    protocols: ['postgresql', 'postgres'],
    require_tld: false,
    require_protocol: true,
  })
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT!: number;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRES_IN!: string;

  @IsInt()
  @Min(60)
  JWT_REFRESH_EXPIRES_IN_SECONDS!: number;

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;

  @IsOptional()
  @IsString()
  COOKIE_DOMAIN?: string;

  @IsString()
  @IsNotEmpty()
  SMTP_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  SMTP_PORT!: number;

  @IsString()
  @IsNotEmpty()
  SMTP_USER!: string;

  @IsString()
  @IsNotEmpty()
  SMTP_PASS!: string;

  @IsEmail()
  @IsNotEmpty()
  SMTP_FROM!: string;

  @IsString()
  @IsNotEmpty()
  STRIPE_SECRET_KEY!: string;

  @IsOptional()
  @IsString()
  STRIPE_WEBHOOK_SECRET?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');

    throw new Error(`Environment validation failed: ${messages}`);
  }

  if (
    validatedConfig.NODE_ENV === NodeEnv.Production &&
    !validatedConfig.STRIPE_WEBHOOK_SECRET
  ) {
    throw new Error(
      'Environment validation failed: STRIPE_WEBHOOK_SECRET is required in production',
    );
  }

  if (
    validatedConfig.NODE_ENV === NodeEnv.Production &&
    validatedConfig.STRIPE_SECRET_KEY.startsWith('sk_live_') &&
    !validatedConfig.FRONTEND_URL.startsWith('https://')
  ) {
    throw new Error(
      'Environment validation failed: live Stripe keys require FRONTEND_URL with https://',
    );
  }

  return validatedConfig;
}
