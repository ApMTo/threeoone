import { Global, Module } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: RedisService,
      useFactory: (config: AppConfigService) => {
        return new RedisService(config.redisHost, config.redisPort);
      },
      inject: [AppConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
