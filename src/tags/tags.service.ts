import { Injectable } from '@nestjs/common';
import { DynamoDbService } from '../dynamodb/dynamodb.service';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

export interface TagItem {
  tagId: string;
  label: string;
  order: number;
}

export interface TagGroup {
  groupId: string;
  groupName: string;
  tags: TagItem[];
}

const HIDDEN_TAGS: Set<string> = new Set(['windsurf', 'copilot']);

@Injectable()
export class TagsService {
  private cache: TagGroup[] | null = null;

  constructor(private readonly dynamoDbService: DynamoDbService) {}

  async getTagGroups(): Promise<TagGroup[]> {
    if (this.cache) return this.cache;

    const docClient = this.dynamoDbService.getDocClient();
    const tableName = this.dynamoDbService.getTableName();

    const result = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: 'begins_with(PK, :prefix)',
        ExpressionAttributeValues: { ':prefix': 'TAG_GROUP#' },
      }),
    );

    const groupMap = new Map<string, TagGroup>();

    for (const item of result.Items ?? []) {
      const groupId = item.groupId as string;
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          groupId,
          groupName: item.groupName as string,
          tags: [],
        });
      }
      groupMap.get(groupId)!.tags.push({
        tagId: item.tagId as string,
        label: item.label as string,
        order: Number(item.order ?? 0),
      });
    }

    const groups = Array.from(groupMap.values());
    for (const g of groups) {
      g.tags = g.tags.filter((t) => !HIDDEN_TAGS.has(t.tagId));
      g.tags.sort((a, b) => a.order - b.order);
    }
    groups.sort((a, b) => a.groupId.localeCompare(b.groupId));

    this.cache = groups;
    return groups;
  }

  async getAllKnownTagIds(): Promise<Set<string>> {
    const groups = await this.getTagGroups();
    const ids = new Set<string>();
    for (const g of groups) {
      for (const t of g.tags) ids.add(t.tagId);
    }
    return ids;
  }
}
