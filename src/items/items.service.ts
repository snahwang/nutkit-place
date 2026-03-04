import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ulid } from 'ulid';
import { Item } from '../entities/item.entity';
import { Star } from '../entities/star.entity';

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
  tag?: string | string[];
  type?: string;
  sort?: string;
  cursor?: string;
  pageSize?: number;
}

export interface ListItemsResult {
  items: ItemRecord[];
  nextCursor?: string;
  hasNext: boolean;
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

function toRecord(entity: Item): ItemRecord {
  return {
    itemId: entity.itemId,
    type: entity.type,
    name: entity.name,
    description: entity.description,
    detailDescription: entity.detailDescription || undefined,
    tags: entity.tags ?? [],
    status: entity.status,
    installActions: entity.installActions as InstallActions | undefined,
    githubUrl: entity.githubUrl || undefined,
    authorId: entity.authorId || undefined,
    authorName: entity.authorName,
    authorEmail: entity.authorEmail || undefined,
    starCount: entity.starCount,
    viewCount: entity.viewCount,
    icon: entity.icon || undefined,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Star)
    private readonly starRepo: Repository<Star>,
    private readonly dataSource: DataSource,
  ) {}

  private toRecord(entity: Item): ItemRecord {
    return toRecord(entity);
  }

  async listPublishedItems(query: ListItemsQuery): Promise<ListItemsResult> {
    const pageSize = query.pageSize || 12;
    const offset = query.cursor
      ? (JSON.parse(
          Buffer.from(query.cursor, 'base64url').toString(),
        ).o as number) || 0
      : 0;

    const qb = this.itemRepo
      .createQueryBuilder('item')
      .where('item.status = :status', { status: 'published' });

    if (query.type) {
      qb.andWhere('item.type = :type', { type: query.type });
    }

    const tags = Array.isArray(query.tag)
      ? query.tag
      : query.tag
        ? [query.tag]
        : [];
    const tagFilters = tags.map((t) => t.trim()).filter(Boolean);
    if (tagFilters.length > 0) {
      // jsonb array overlap: item.tags ?| array[...]
      qb.andWhere('item.tags \\?| :tags', { tags: tagFilters });
    }

    if (query.q) {
      const lower = query.q.trim().replace(/\s+/g, ' ').toLowerCase();
      if (lower) {
        qb.andWhere(
          '(LOWER(item.name) LIKE :q OR LOWER(item.description) LIKE :q)',
          { q: `%${lower}%` },
        );
      }
    }

    // Sort
    if (query.sort === 'stars') {
      qb.orderBy('item.starCount', 'DESC');
    } else if (query.sort === 'name_asc') {
      qb.orderBy('item.name', 'ASC');
    } else if (query.sort === 'name_desc') {
      qb.orderBy('item.name', 'DESC');
    } else {
      qb.orderBy('item.createdAt', 'DESC');
    }

    qb.skip(offset).take(pageSize + 1);

    const rows = await qb.getMany();
    const hasNext = rows.length > pageSize;
    const pageItems = hasNext ? rows.slice(0, pageSize) : rows;
    const nextCursor = hasNext
      ? Buffer.from(JSON.stringify({ o: offset + pageSize })).toString(
          'base64url',
        )
      : undefined;

    return { items: pageItems.map((r) => this.toRecord(r)), nextCursor, hasNext };
  }

  async getItemById(id: string): Promise<ItemRecord | null> {
    const item = await this.itemRepo.findOneBy({ itemId: id });
    return item ? this.toRecord(item) : null;
  }

  async createItem(input: CreateItemInput): Promise<ItemRecord> {
    const entity = this.itemRepo.create({
      itemId: ulid(),
      type: input.type,
      name: input.name,
      description: input.description,
      detailDescription: input.detailDescription || '',
      tags: input.tags || [],
      status: 'published',
      installActions: (input.installActions as any) || {},
      githubUrl: input.githubUrl || '',
      icon: input.icon || '',
      authorId: input.authorId || '',
      authorName: input.authorName || 'Anonymous',
      authorEmail: input.authorEmail || '',
      starCount: 0,
      viewCount: 0,
    });
    const saved = await this.itemRepo.save(entity);
    return this.toRecord(saved);
  }

  async updateItem(
    id: string,
    input: Partial<CreateItemInput>,
  ): Promise<ItemRecord | null> {
    const existing = await this.itemRepo.findOneBy({ itemId: id });
    if (!existing) return null;

    if (input.name !== undefined) existing.name = input.name;
    if (input.type !== undefined) existing.type = input.type;
    if (input.description !== undefined) existing.description = input.description;
    if (input.detailDescription !== undefined)
      existing.detailDescription = input.detailDescription;
    if (input.tags !== undefined) existing.tags = input.tags;
    if (input.installActions !== undefined)
      existing.installActions = input.installActions as any;
    if (input.githubUrl !== undefined) existing.githubUrl = input.githubUrl;
    if (input.icon !== undefined) existing.icon = input.icon;

    const saved = await this.itemRepo.save(existing);
    return this.toRecord(saved);
  }

  async deleteItem(id: string): Promise<void> {
    await this.itemRepo.delete({ itemId: id });
  }

  async hasUserStarred(userId: string, itemId: string): Promise<boolean> {
    const count = await this.starRepo.countBy({ userId, itemId });
    return count > 0;
  }

  async toggleStar(
    userId: string,
    itemId: string,
  ): Promise<{ starred: boolean; starCount: number }> {
    return this.dataSource.transaction(async (manager) => {
      const starRepo = manager.getRepository(Star);
      const itemRepo = manager.getRepository(Item);

      const existing = await starRepo.findOneBy({ userId, itemId });

      if (existing) {
        await starRepo.remove(existing);
        await itemRepo
          .createQueryBuilder()
          .update()
          .set({ starCount: () => 'GREATEST("starCount" - 1, 0)' })
          .where('itemId = :itemId', { itemId })
          .execute();
        const item = await itemRepo.findOneBy({ itemId });
        return { starred: false, starCount: item?.starCount ?? 0 };
      }

      await starRepo.save(starRepo.create({ userId, itemId }));
      await itemRepo
        .createQueryBuilder()
        .update()
        .set({ starCount: () => '"starCount" + 1' })
        .where('itemId = :itemId', { itemId })
        .execute();
      const item = await itemRepo.findOneBy({ itemId });
      return { starred: true, starCount: item?.starCount ?? 0 };
    });
  }

  async getUserStarredItemIds(userId: string): Promise<string[]> {
    const stars = await this.starRepo.findBy({ userId });
    return stars.map((s) => s.itemId);
  }
}
