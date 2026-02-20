import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { ItemsService } from './items/items.service';
import { TagsService } from './tags/tags.service';

@Controller()
export class AppController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly tagsService: TagsService,
  ) {}

  @Get()
  @Render('index')
  async getIndex(
    @Req() req: Request,
    @Query('q') q?: string,
    @Query('tag') tag?: string | string[],
    @Query('type') type?: string,
    @Query('sort') sort?: string,
    @Query('cursor') cursor?: string,
  ) {
    const tags = Array.isArray(tag) ? tag : tag ? [tag] : [];

    const result = await this.itemsService.listPublishedItems({
      q,
      tag: tags,
      type,
      sort,
      cursor,
    });

    const user = (req as any).user;
    let starredIds = new Set<string>();
    if (user) {
      const ids = await this.itemsService.getUserStarredItemIds(user.id);
      starredIds = new Set(ids);
    }

    const itemsWithStarred = result.items.map((item: any) => ({
      ...item,
      starred: starredIds.has(item.itemId),
    }));

    // Build next URL preserving all filters
    let nextUrl: string | undefined;
    if (result.hasNext && result.nextCursor) {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (type) params.append('type', type);
      if (sort && sort !== 'latest') params.append('sort', sort);
      for (const t of tags) params.append('tag', t);
      params.append('cursor', result.nextCursor);
      nextUrl = `/?${params.toString()}`;
    }

    // Tag groups for quick filters (USE_CASE + CATEGORY)
    const allTagGroups = await this.tagsService.getTagGroups();
    const filterTagGroups = allTagGroups.filter(
      (g) => g.groupId === 'USE_CASE' || g.groupId === 'CATEGORY',
    );

    return {
      title: 'Zarket Places',
      user: user || null,
      q: q || '',
      tags,
      type: type || '',
      sort: sort || 'latest',
      items: itemsWithStarred,
      nextUrl,
      hasNext: result.hasNext,
      filterTagGroups,
    };
  }
}
