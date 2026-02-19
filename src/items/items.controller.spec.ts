import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService, ItemRecord } from './items.service';

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
  incrementViewCount: jest.fn().mockResolvedValue(undefined),
  listPublishedItems: jest.fn(),
};

describe('ItemsController', () => {
  let controller: ItemsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: mockItemsService }],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  describe('GET /items/new', () => {
    it('should return form data', () => {
      const result = controller.getNewForm({ user: { name: 'Tester' } } as any);
      expect(result).toHaveProperty('title', 'Register New Item');
      expect(result).toHaveProperty('user');
    });
  });

  describe('GET /items/:id', () => {
    it('should render detail for existing item', async () => {
      mockItemsService.getItemById.mockResolvedValue(mockItem);
      const res = { render: jest.fn(), status: jest.fn().mockReturnThis() } as any;

      await controller.getDetail('test-001', res);

      expect(mockItemsService.getItemById).toHaveBeenCalledWith('test-001');
      expect(mockItemsService.incrementViewCount).toHaveBeenCalledWith('test-001');
      expect(res.render).toHaveBeenCalledWith('items/detail', {
        title: 'test-mcp',
        item: mockItem,
        hasInstallActions: { command: 'claude mcp add test' },
      });
    });

    it('should return 404 for missing item', async () => {
      mockItemsService.getItemById.mockResolvedValue(null);
      const res = { render: jest.fn(), status: jest.fn().mockReturnThis() } as any;

      await controller.getDetail('missing', res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
        statusCode: 404,
      }));
    });
  });

  describe('POST /api/items', () => {
    it('should create item and redirect', async () => {
      mockItemsService.createItem.mockResolvedValue({ ...mockItem, itemId: 'new-id' });
      const body = {
        type: 'MCP',
        name: 'new-mcp',
        description: 'desc',
        tags: 'dev, api',
        claude_code_command: 'claude mcp add new',
      };
      const req = { user: { id: 'u1', name: 'Tester', email: 'test@test.com' } } as any;
      const res = { redirect: jest.fn() } as any;

      await controller.createItem(body, undefined, req, res);

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

    it('should use uploaded file for detailDescription', async () => {
      mockItemsService.createItem.mockResolvedValue({ ...mockItem, itemId: 'new-id' });
      const file = { buffer: Buffer.from('# From file') } as Express.Multer.File;
      const body = { type: 'MCP', name: 'x', description: 'y', tags: '' };
      const req = { user: null } as any;
      const res = { redirect: jest.fn() } as any;

      await controller.createItem(body, file, req, res);

      expect(mockItemsService.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ detailDescription: '# From file' }),
      );
    });
  });

  describe('POST /api/items/:id/delete', () => {
    it('should delete item and redirect to home', async () => {
      mockItemsService.deleteItem.mockResolvedValue(undefined);
      const res = { redirect: jest.fn() } as any;

      await controller.deleteItem('test-001', res);

      expect(mockItemsService.deleteItem).toHaveBeenCalledWith('test-001');
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });
});
