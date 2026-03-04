import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagGroup as TagGroupEntity } from '../entities/tag-group.entity';

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

  constructor(
    @InjectRepository(TagGroupEntity)
    private readonly tagGroupRepo: Repository<TagGroupEntity>,
  ) {}

  async getTagGroups(): Promise<TagGroup[]> {
    if (this.cache) return this.cache;

    const entities = await this.tagGroupRepo.find({
      relations: ['tags'],
      order: { groupId: 'ASC' },
    });

    const groups: TagGroup[] = entities.map((g) => ({
      groupId: g.groupId,
      groupName: g.groupName,
      tags: (g.tags || [])
        .filter((t) => !HIDDEN_TAGS.has(t.tagId))
        .sort((a, b) => a.order - b.order)
        .map((t) => ({ tagId: t.tagId, label: t.label, order: t.order })),
    }));

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
