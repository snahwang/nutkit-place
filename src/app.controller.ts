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

    return {
      title: 'Zarket Places',
      user: (req as any).user || null,
      q: q || '',
      tags, // array for multi-select
      type: type || '',
      sort: sort || 'latest',
      items,
    };
  }
}
