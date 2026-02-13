import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamoDBClient,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDbService implements OnModuleInit {
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('DYNAMODB_ENDPOINT');
    const region =
      this.configService.get<string>('DYNAMODB_REGION') || 'ap-northeast-2';
    this.tableName =
      this.configService.get<string>('DYNAMODB_TABLE_NAME') || 'ZarketPlaces';

    const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = {
      region,
    };
    if (endpoint) {
      clientConfig.endpoint = endpoint;
    }

    this.client = new DynamoDBClient(clientConfig);
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  async onModuleInit() {
    // Log connection info on startup
    const endpoint = this.configService.get<string>('DYNAMODB_ENDPOINT');
    console.log(
      `DynamoDB configured: table=${this.tableName}, endpoint=${endpoint || 'AWS default'}`,
    );
  }

  getClient(): DynamoDBClient {
    return this.client;
  }

  getDocClient(): DynamoDBDocumentClient {
    return this.docClient;
  }

  getTableName(): string {
    return this.tableName;
  }

  async describeTable() {
    const command = new DescribeTableCommand({
      TableName: this.tableName,
    });
    return this.client.send(command);
  }
}
