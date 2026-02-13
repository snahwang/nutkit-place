import { Controller, Get, Param, Render } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('new')
  @Render('items/new')
  getNewForm() {
    // TODO: Add JwtAuthGuard when auth is implemented
    return { title: 'Register New Item' };
  }

  @Get(':id')
  @Render('items/detail')
  async getDetail(@Param('id') id: string) {
    // TODO: Fetch item from DynamoDB, increment viewCount
    return {
      title: 'Item Detail',
      item: {
        itemId: id,
        name: 'Placeholder',
        description: 'This is a placeholder item.',
        type: 'MCP',
      },
    };
  }

  @Get(':id/edit')
  @Render('items/edit')
  async getEditForm(@Param('id') id: string) {
    // TODO: Add JwtAuthGuard + ownership check
    return {
      title: 'Edit Item',
      item: { itemId: id },
    };
  }
}
