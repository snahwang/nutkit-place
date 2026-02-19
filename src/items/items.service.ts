import { Injectable } from '@nestjs/common';
import { DynamoDbService } from '../dynamodb/dynamodb.service';
import {
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';

export interface ToolInstallAction {
  command?: string;
  url?: string;
  path?: string;
  notes?: string;
}

export interface InstallActions {
  claude_code?: ToolInstallAction;
  cursor?: ToolInstallAction;
}

export interface ItemRecord {
  itemId: string;
  type: string;
  name: string;
  description: string;
  detailDescription?: string;
  tags: string[];
  status: string;
  installCommand?: string;
  installActions?: InstallActions;
  githubUrl?: string;
  authorId?: string;
  authorName: string;
  authorEmail?: string;
  starCount: number;
  viewCount: number;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListItemsQuery {
  q?: string;
  tag?: string;
  type?: string;
  sort?: string;
}

export interface CreateItemInput {
  type: string;
  name: string;
  description: string;
  detailDescription?: string;
  tags?: string[];
  installActions?: InstallActions;
  githubUrl?: string;
  icon?: string;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
}

@Injectable()
export class ItemsService {
  constructor(private readonly dynamoDbService: DynamoDbService) {}

  private mapItem(raw: Record<string, any>): ItemRecord {
    return {
      itemId: raw.itemId ?? '',
      type: raw.type ?? '',
      name: raw.name ?? '',
      description: raw.description ?? '',
      detailDescription: raw.detailDescription,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      status: raw.status ?? 'published',
      installCommand: raw.installCommand,
      installActions: raw.installActions,
      githubUrl: raw.githubUrl,
      authorId: raw.authorId,
      authorName: raw.authorName ?? '',
      authorEmail: raw.authorEmail,
      starCount: raw.starCount ?? 0,
      viewCount: raw.viewCount ?? 0,
      icon: raw.icon,
      createdAt: raw.createdAt ?? '',
      updatedAt: raw.updatedAt ?? '',
    };
  }

  async listPublishedItems(query: ListItemsQuery): Promise<ItemRecord[]> {
    const tableName = this.dynamoDbService.getTableName();
    const docClient = this.dynamoDbService.getDocClient();

    const result = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression:
          'SK = :sk AND begins_with(PK, :pkPrefix) AND #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':sk': 'METADATA',
          ':pkPrefix': 'ITEM#',
          ':status': 'published',
        },
      }),
    );

    let items = (result.Items ?? []).map((i) => this.mapItem(i));

    if (query.type) {
      items = items.filter((i) => i.type === query.type);
    }
    if (query.tag) {
      items = items.filter((i) => i.tags.includes(query.tag!));
    }
    if (query.q) {
      const lower = query.q.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(lower) ||
          i.description.toLowerCase().includes(lower),
      );
    }
    if (query.sort === 'stars') {
      items.sort((a, b) => b.starCount - a.starCount);
    } else {
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return items;
  }

  async getItemById(id: string): Promise<ItemRecord | null> {
    const result = await this.dynamoDbService.getDocClient().send(
      new GetCommand({
        TableName: this.dynamoDbService.getTableName(),
        Key: { PK: `ITEM#${id}`, SK: 'METADATA' },
      }),
    );
    if (!result.Item) return null;
    return this.mapItem(result.Item);
  }

  async createItem(input: CreateItemInput): Promise<ItemRecord> {
    const id = ulid();
    const now = new Date().toISOString();
    const item: Record<string, any> = {
      PK: `ITEM#${id}`,
      SK: 'METADATA',
      itemId: id,
      type: input.type,
      name: input.name,
      description: input.description,
      detailDescription: input.detailDescription || '',
      tags: input.tags || [],
      status: 'published',
      installActions: input.installActions || {},
      githubUrl: input.githubUrl || '',
      icon: input.icon || '',
      authorId: input.authorId || '',
      authorName: input.authorName || 'Anonymous',
      authorEmail: input.authorEmail || '',
      starCount: 0,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await this.dynamoDbService.getDocClient().send(
      new PutCommand({
        TableName: this.dynamoDbService.getTableName(),
        Item: item,
      }),
    );

    return this.mapItem(item);
  }

  async updateItem(
    id: string,
    input: Partial<CreateItemInput>,
  ): Promise<ItemRecord | null> {
    const docClient = this.dynamoDbService.getDocClient();
    const tableName = this.dynamoDbService.getTableName();

    const existing = await docClient.send(
      new GetCommand({ TableName: tableName, Key: { PK: `ITEM#${id}`, SK: 'METADATA' } }),
    );
    if (!existing.Item) return null;

    const raw = existing.Item;
    const now = new Date().toISOString();

    if (input.name !== undefined) raw.name = input.name;
    if (input.type !== undefined) raw.type = input.type;
    if (input.description !== undefined) raw.description = input.description;
    if (input.detailDescription !== undefined)
      raw.detailDescription = input.detailDescription;
    if (input.tags !== undefined) raw.tags = input.tags;
    if (input.installActions !== undefined)
      raw.installActions = input.installActions;
    if (input.githubUrl !== undefined) raw.githubUrl = input.githubUrl;
    if (input.icon !== undefined) raw.icon = input.icon;
    raw.updatedAt = now;

    await docClient.send(new PutCommand({ TableName: tableName, Item: raw }));
    return this.mapItem(raw);
  }

  async deleteItem(id: string): Promise<void> {
    await this.dynamoDbService.getDocClient().send(
      new DeleteCommand({
        TableName: this.dynamoDbService.getTableName(),
        Key: { PK: `ITEM#${id}`, SK: 'METADATA' },
      }),
    );
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.dynamoDbService
      .getDocClient()
      .send(
        new UpdateCommand({
          TableName: this.dynamoDbService.getTableName(),
          Key: { PK: `ITEM#${id}`, SK: 'METADATA' },
          UpdateExpression: 'ADD viewCount :inc',
          ExpressionAttributeValues: { ':inc': 1 },
        }),
      )
      .catch(() => {
        /* non-critical — ignore failures */
      });
  }
}
