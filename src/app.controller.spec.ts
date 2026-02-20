import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ItemsService } from './items/items.service';
import { TagsService } from './tags/tags.service';

describe('AppController', () => {
  let controller: AppController;

  const mockItemsService = {
    getUserStarredItemIds: jest.fn().mockResolvedValue([]),
    listPublishedItems: jest.fn().mockResolvedValue({
      items: [
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
      ],
      nextCursor: undefined,
      hasNext: false,
    }),
  };

  const mockTagsService = {
    getTagGroups: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: ItemsService, useValue: mockItemsService },
        { provide: TagsService, useValue: mockTagsService },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should return index page data with items from DynamoDB', async () => {
    const result = await controller.getIndex({} as any);
    expect(result).toHaveProperty('title', 'Zarket Places');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('test-mcp');
    expect(result).toHaveProperty('hasNext', false);
    expect(result).toHaveProperty('filterTagGroups');
    expect(mockItemsService.listPublishedItems).toHaveBeenCalledWith({
      q: undefined,
      tag: [],
      type: undefined,
      sort: undefined,
      cursor: undefined,
    });
  });

  it('should pass query params to service', async () => {
    await controller.getIndex(
      {} as any,
      'search',
      'dev',
      'MCP',
      'stars',
      undefined,
    );
    expect(mockItemsService.listPublishedItems).toHaveBeenCalledWith({
      q: 'search',
      tag: ['dev'],
      type: 'MCP',
      sort: 'stars',
      cursor: undefined,
    });
  });

  it('should pass cursor to service for pagination', async () => {
    const cursor = Buffer.from(JSON.stringify({ o: 12 })).toString(
      'base64url',
    );
    await controller.getIndex({} as any, undefined, undefined, undefined, undefined, cursor);
    expect(mockItemsService.listPublishedItems).toHaveBeenCalledWith(
      expect.objectContaining({ cursor }),
    );
  });
});
