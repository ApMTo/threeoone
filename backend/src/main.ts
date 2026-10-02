import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const appConfig = app.get(AppConfigService);

  // Needed behind nginx / Cloudflare so req.ip and secure cookies work correctly.
  const httpAdapter = app.getHttpAdapter().getInstance();
  httpAdapter.set('trust proxy', 1);

  app.use(
    helmet({
      // API is consumed by a separate Next.js origin; CSP belongs on the frontend.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.enableCors({
    origin: appConfig.frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableShutdownHooks();

  await app.listen(appConfig.port);

  console.log(`Application running in ${appConfig.nodeEnv} mode on port ${appConfig.port}`);
  if (!appConfig.stripeWebhookSecret) {
    console.warn(
      'STRIPE_WEBHOOK_SECRET is not set. Local tip: stripe listen --forward-to localhost:3001/api/webhooks/stripe',
    );
  }
}

void bootstrap();
