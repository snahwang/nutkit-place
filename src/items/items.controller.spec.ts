import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService, ItemRecord } from './items.service';
import { TagsService } from '../tags/tags.service';

const mockItem: ItemRecord = {
  itemId: 'test-001',
  type: 'MCP',
  name: 'test-mcp',
  description: 'Test item',
  detailDescription: '# Test\nDetail',
  tags: ['dev'],
  status: 'published',
  installActions: {
    claude_code: { command: 'claude mcp add test' },
  },
  starCount: 5,
  viewCount: 10,
  authorId: 'u1',
  authorName: 'Tester',
  authorEmail: 'test@test.com',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockItemsService = {
  getItemById: jest.fn(),
  createItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  hasUserStarred: jest.fn(),
  toggleStar: jest.fn(),
  listPublishedItems: jest.fn(),
};

const mockTagsService = {
  getTagGroups: jest.fn().mockResolvedValue([]),
  getAllKnownTagIds: jest
    .fn()
    .mockResolvedValue(new Set(['dev', 'api', 'mcp', 'payment'])),
};

describe('ItemsController', () => {
  let controller: ItemsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockTagsService.getAllKnownTagIds.mockResolvedValue(
      new Set(['dev', 'api', 'mcp', 'payment']),
    );
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        { provide: ItemsService, useValue: mockItemsService },
        { provide: TagsService, useValue: mockTagsService },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  describe('GET /items/new', () => {
    it('should return form data with tagGroups', async () => {
      const result = await controller.getNewForm({
        user: { name: 'Tester' },
      } as any);
      expect(result).toHaveProperty('title', 'Register New Item');
      expect(result).toHaveProperty('tagGroups');
      expect(result).not.toHaveProperty('emojiPresets');
    });
  });

  describe('GET /items/:id', () => {
    it('should render detail for existing item', async () => {
      mockItemsService.getItemById.mockResolvedValue(mockItem);
      mockItemsService.hasUserStarred.mockResolvedValue(false);
      const req = {
        user: { id: 'u1', email: 'test@test.com', name: 'Tester' },
      } as any;
      const res = {
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as any;

      await controller.getDetail('test-001', req, res);

      expect(mockItemsService.getItemById).toHaveBeenCalledWith('test-001');
      expect(res.render).toHaveBeenCalledWith('items/detail', {
        title: 'test-mcp',
        item: mockItem,
        hasInstallActions: { command: 'claude mcp add test' },
        starred: false,
        canEdit: true,
      });
    });

    it('should return 404 for missing item', async () => {
      mockItemsService.getItemById.mockResolvedValue(null);
      const req = { user: null } as any;
      const res = {
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as any;

      await controller.getDetail('missing', req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ statusCode: 404 }),
      );
    });
  });

  describe('POST /api/items', () => {
    it('should create item with validated tags and redirect', async () => {
      mockItemsService.createItem.mockResolvedValue({
        ...mockItem,
        itemId: 'new-id',
      });
      const body = {
        type: 'MCP',
        name: 'new-mcp',
        description: 'desc',
        tags: 'dev, api, unknown_tag',
        claude_code_command: 'claude mcp add new',
      };
      const req = {
        user: { id: 'u1', name: 'Tester', email: 'test@test.com' },
      } as any;
      const res = { redirect: jest.fn() } as any;

      await controller.createItem(body, req, res);

      expect(mockItemsService.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'MCP',
          name: 'new-mcp',
          tags: ['dev', 'api'],
          installActions: { claude_code: { command: 'claude mcp add new' } },
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith('/items/new-id');
    });

    it('should write description to both description and detailDescription', async () => {
      mockItemsService.createItem.mockResolvedValue({
        ...mockItem,
        itemId: 'new-id',
      });
      const body = { type: 'MCP', name: 'x', description: 'unified text', tags: '' };
      const req = { user: null } as any;
      const res = { redirect: jest.fn() } as any;

      await controller.createItem(body, req, res);

      expect(mockItemsService.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'unified text',
          detailDescription: 'unified text',
        }),
      );
    });
  });

  describe('POST /api/items/:id/delete', () => {
    it('should delete item and redirect to home', async () => {
      mockItemsService.getItemById.mockResolvedValue(mockItem);
      mockItemsService.deleteItem.mockResolvedValue(undefined);
      const req = {
        user: { id: 'u1', email: 'test@test.com', name: 'Tester' },
      } as any;
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      } as any;

      await controller.deleteItem('test-001', req, res);

      expect(mockItemsService.deleteItem).toHaveBeenCalledWith('test-001');
      expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('should return 403 when user is not the author', async () => {
      mockItemsService.getItemById.mockResolvedValue(mockItem);
      const req = {
        user: { id: 'other', email: 'other@test.com', name: 'Other' },
      } as any;
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      } as any;

      await controller.deleteItem('test-001', req, res);

      expect(mockItemsService.deleteItem).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('POST /api/items/:id/star', () => {
    it('should toggle star and return result', async () => {
      mockItemsService.toggleStar.mockResolvedValue({
        starred: true,
        starCount: 6,
      });
      const req = {
        user: { id: 'u1', email: 'test@test.com', name: 'Tester' },
      } as any;

      const result = await controller.toggleStar('test-001', req);

      expect(mockItemsService.toggleStar).toHaveBeenCalledWith(
        'u1',
        'test-001',
      );
      expect(result).toEqual({ starred: true, starCount: 6 });
    });
  });
});
