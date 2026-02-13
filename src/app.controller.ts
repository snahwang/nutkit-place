import { Controller, Get, Query, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  getIndex(
    @Query('q') q?: string,
    @Query('tag') tag?: string,
    @Query('sort') sort?: string,
  ) {
    return {
      title: 'Zarket Places',
      q: q || '',
      tag: tag || '',
      sort: sort || 'latest',
      items: [],
    };
  }
}
