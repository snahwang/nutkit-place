import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { ItemsModule } from './items/items.module';
import { AuthModule } from './auth/auth.module';
import { TagsModule } from './tags/tags.module';
import { Item } from './entities/item.entity';
import { Star } from './entities/star.entity';
import { TagGroup } from './entities/tag-group.entity';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST') || 'localhost',
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USERNAME') || 'zarketplace',
        password: config.get<string>('DB_PASSWORD') || 'zarketplace',
        database: config.get<string>('DB_DATABASE') || 'zarketplace',
        entities: [Item, Star, TagGroup, Tag],
        synchronize: (config.get<string>('DB_SYNC') || 'true') === 'true',
        logging: config.get<string>('DB_LOGGING') === 'true',
      }),
    }),
    TagsModule,
    HealthModule,
    ItemsModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
