import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { ItemsService } from './items/items.service';

@Controller()
export class AppController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @Render('index')
  async getIndex(
    @Req() req: Request,
    @Query('q') q?: string,
    @Query('tag') tag?: string | string[],
    @Query('type') type?: string,
    @Query('sort') sort?: string,
  ) {
    const tags = Array.isArray(tag) ? tag : tag ? [tag] : [];

    const items = await this.itemsService.listPublishedItems({
      q,
      tag: tags,
      type,
      sort,
    });

    const user = (req as any).user;
    let starredIds = new Set<string>();
    if (user) {
      const ids = await this.itemsService.getUserStarredItemIds(user.id);
      starredIds = new Set(ids);
    }

    const itemsWithStarred = items.map((item: any) => ({
      ...item,
      starred: starredIds.has(item.itemId),
    }));

    return {
      title: 'Zarket Places',
      user: user || null,
      q: q || '',
      tags,
      type: type || '',
      sort: sort || 'latest',
      items: itemsWithStarred,
    };
  }
}
