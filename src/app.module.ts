import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DynamoDbModule } from './dynamodb/dynamodb.module';
import { HealthModule } from './health/health.module';
import { ItemsModule } from './items/items.module';
import { AuthModule } from './auth/auth.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamoDbModule,
    TagsModule,
    HealthModule,
    ItemsModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
