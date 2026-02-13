import { Controller, Get, Query, Render } from '@nestjs/common';
import { ItemsService } from './items/items.service';

@Controller()
export class AppController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @Render('index')
  async getIndex(
    @Query('q') q?: string,
    @Query('tag') tag?: string,
    @Query('type') type?: string,
    @Query('sort') sort?: string,
  ) {
    const items = await this.itemsService.listPublishedItems({
      q,
      tag,
      type,
      sort,
    });

    return {
      title: 'Zarket Places',
      q: q || '',
      tag: tag || '',
      type: type || '',
      sort: sort || 'latest',
      items,
    };
  }
}
