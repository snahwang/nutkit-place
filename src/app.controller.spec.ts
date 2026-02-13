import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ItemsService } from './items/items.service';

describe('AppController', () => {
  let controller: AppController;

  const mockItemsService = {
    listPublishedItems: jest.fn().mockResolvedValue([
      {
        itemId: 'test-001',
        type: 'MCP',
        name: 'test-mcp',
        description: 'Test item',
        tags: ['dev'],
        starCount: 5,
        authorName: 'Tester',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        status: 'published',
        viewCount: 0,
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: ItemsService, useValue: mockItemsService }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should return index page data with items from DynamoDB', async () => {
    const result = await controller.getIndex();
    expect(result).toHaveProperty('title', 'Zarket Places');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('test-mcp');
    expect(mockItemsService.listPublishedItems).toHaveBeenCalledWith({
      q: undefined,
      tag: undefined,
      type: undefined,
      sort: undefined,
    });
  });

  it('should pass query params to service', async () => {
    await controller.getIndex('search', 'dev', 'MCP', 'stars');
    expect(mockItemsService.listPublishedItems).toHaveBeenCalledWith({
      q: 'search',
      tag: 'dev',
      type: 'MCP',
      sort: 'stars',
    });
  });
});
