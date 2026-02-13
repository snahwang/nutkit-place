import { Injectable } from '@nestjs/common';
import { DynamoDbService } from '../dynamodb/dynamodb.service';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

export interface ItemRecord {
  itemId: string;
  type: string;
  name: string;
  description: string;
  detailDescription?: string;
  tags: string[];
  status: string;
  installCommand?: string;
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

@Injectable()
export class ItemsService {
  constructor(private readonly dynamoDbService: DynamoDbService) {}

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

    let items: ItemRecord[] = (result.Items ?? []).map((item) => ({
      itemId: item.itemId as string,
      type: item.type as string,
      name: item.name as string,
      description: (item.description as string) || '',
      detailDescription: item.detailDescription as string | undefined,
      tags: (item.tags as string[]) || [],
      status: item.status as string,
      installCommand: item.installCommand as string | undefined,
      githubUrl: item.githubUrl as string | undefined,
      authorId: item.authorId as string | undefined,
      authorName: (item.authorName as string) || '',
      authorEmail: item.authorEmail as string | undefined,
      starCount: (item.starCount as number) || 0,
      viewCount: (item.viewCount as number) || 0,
      icon: item.icon as string | undefined,
      createdAt: (item.createdAt as string) || '',
      updatedAt: (item.updatedAt as string) || '',
    }));

    // Filter by type
    if (query.type) {
      items = items.filter((i) => i.type === query.type);
    }

    // Filter by tag (exact match in tags list)
    if (query.tag) {
      items = items.filter((i) => i.tags.includes(query.tag!));
    }

    // Filter by q (substring match on name or description)
    if (query.q) {
      const lower = query.q.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(lower) ||
          i.description.toLowerCase().includes(lower),
      );
    }

    // Sort
    if (query.sort === 'stars') {
      items.sort((a, b) => b.starCount - a.starCount);
    } else {
      // latest: sort by createdAt desc
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return items;
  }
}
