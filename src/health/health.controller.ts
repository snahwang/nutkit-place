import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DynamoDbService } from '../dynamodb/dynamodb.service';

@Controller('health')
export class HealthController {
  constructor(private readonly dynamoDbService: DynamoDbService) {}

  @Get()
  async check() {
    try {
      await this.dynamoDbService.describeTable();
      return {
        status: 'ok',
        db: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          db: 'disconnected',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
