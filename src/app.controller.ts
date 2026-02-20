import { Controller, Get, Query, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
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

    // Tag groups for quick filters (CATEGORY + USE_CASE + TARGET_TOOL)
    const allTagGroups = await this.tagsService.getTagGroups();
    const visibleGroupIds = new Set(['CATEGORY', 'USE_CASE', 'TARGET_TOOL']);
    const filterTagGroups = allTagGroups
      .filter((g) => visibleGroupIds.has(g.groupId))
      .map((g) => {
        if (g.groupId === 'CATEGORY') {
          // Hide payment/auth from category quick filters (UI only)
          return {
            ...g,
            tags: g.tags.filter((t) => t.tagId !== 'payment' && t.tagId !== 'auth'),
          };
        }
        return g;
      });

    return {
      title: 'Zarket Places',
      user: user || null,
      q: q || '',
      tags,
      type: type || '',
      sort: sort || 'latest',
      items: itemsWithStarred,
      nextCursor: result.nextCursor || '',
      hasNext: result.hasNext,
      filterTagGroups,
    };
  }

  @Get('api/items')
  async getItemsJson(
    @Req() req: Request,
    @Res() res: Response,
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

    const items = result.items.map((item: any) => ({
      ...item,
      starred: starredIds.has(item.itemId),
    }));

    res.json({
      items,
      nextCursor: result.nextCursor || null,
      hasNext: result.hasNext,
    });
  }
}
