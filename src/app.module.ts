import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DynamoDbModule } from './dynamodb/dynamodb.module';
import { HealthModule } from './health/health.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamoDbModule,
    HealthModule,
    ItemsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
