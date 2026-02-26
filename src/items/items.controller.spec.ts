import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
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

const mockSkillItem: ItemRecord = {
  ...mockItem,
  itemId: 'skill-001',
  type: 'Skill',
  name: 'my-skill',
  installActions: {
    claude_code: { notes: '# Skill doc\nContent here' },
  },
};

const mockRepoSkillItem: ItemRecord = {
  ...mockItem,
  itemId: 'skill-repo-001',
  type: 'Skill',
  name: 'repo-skill',
  githubUrl: 'https://github.com/acme/cool-skill',
  installActions: {
    claude_code: {
      command: 'npx skills add acme/cool-skill',
      notes: '# Cool Skill\nREADME content',
    },
  },
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
        { provide: ConfigService, useValue: { get: () => 'true' } },
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
    });
  });

  describe('GET /items/:id', () => {
    it('should render detail for MCP item with hasInstallActions', async () => {
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

      expect(res.render).toHaveBeenCalledWith(
        'items/detail',
        expect.objectContaining({
          title: 'test-mcp',
          isDocType: false,
          hasInstallActions: { command: 'claude mcp add test' },
          docMarkdown: '',
        }),
      );
    });

    it('should render detail for Skill item with docMarkdown', async () => {
      mockItemsService.getItemById.mockResolvedValue(mockSkillItem);
      mockItemsService.hasUserStarred.mockResolvedValue(false);
      const req = { user: { id: 'u1', email: 'test@test.com', name: 'Tester' } } as any;
      const res = { render: jest.fn(), status: jest.fn().mockReturnThis() } as any;

      await controller.getDetail('skill-001', req, res);

      expect(res.render).toHaveBeenCalledWith(
        'items/detail',
        expect.objectContaining({
          isDocType: true,
          hasInstallActions: false,
          docMarkdown: '# Skill doc\nContent here',
          skillInstallCommand: '',
        }),
      );
    });

    it('should render detail for repo-based Skill with skillInstallCommand', async () => {
      mockItemsService.getItemById.mockResolvedValue(mockRepoSkillItem);
      mockItemsService.hasUserStarred.mockResolvedValue(false);
      const req = { user: { id: 'u1', email: 'test@test.com', name: 'Tester' } } as any;
      const res = { render: jest.fn(), status: jest.fn().mockReturnThis() } as any;

      await controller.getDetail('skill-repo-001', req, res);

      expect(res.render).toHaveBeenCalledWith(
        'items/detail',
        expect.objectContaining({
          isDocType: true,
          skillInstallCommand: 'npx skills add acme/cool-skill',
          docMarkdown: '# Cool Skill\nREADME content',
        }),
      );
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
    });
  });

  describe('GET /items/:id/doc.md', () => {
    it('should return markdown download for Skill item', async () => {
      mockItemsService.getItemById.mockResolvedValue(mockSkillItem);
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
        setHeader: jest.fn(),
        send: jest.fn(),
      } as any;

      await controller.downloadDoc('skill-001', res);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="my-skill.md"',
      );
      expect(res.send).toHaveBeenCalledWith('# Skill doc\nContent here');
    });

    it('should return 404 for MCP item', async () => {
      mockItemsService.getItemById.mockResolvedValue(mockItem);
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
        setHeader: jest.fn(),
        send: jest.fn(),
      } as any;

      await controller.downloadDoc('test-001', res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('POST /api/items', () => {
    it('should create MCP item with install actions', async () => {
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

    it('should create Skill with skill_repo: fetch README and set install command', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('# Fetched README'),
      }) as any;

      mockItemsService.createItem.mockResolvedValue({
        ...mockRepoSkillItem,
        itemId: 'skill-repo-new',
      });
      const body = {
        type: 'Skill',
        name: 'repo-skill',
        description: 'a repo skill',
        tags: '',
        skill_repo: 'acme/cool-skill',
      };
      const req = { user: { id: 'u1', name: 'Tester', email: 'test@test.com' } } as any;
      const res = { redirect: jest.fn() } as any;

      await controller.createItem(body, undefined, req, res);

      expect(mockItemsService.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Skill',
          githubUrl: 'https://github.com/acme/cool-skill',
          installActions: {
            claude_code: {
              command: 'npx skills add acme/cool-skill',
              notes: '# Fetched README',
            },
          },
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith('/items/skill-repo-new');
      global.fetch = originalFetch;
    });

    it('should create Skill item with doc_markdown in installActions.claude_code.notes', async () => {
      mockItemsService.createItem.mockResolvedValue({
        ...mockSkillItem,
        itemId: 'skill-new',
      });
      const body = {
        type: 'Skill',
        name: 'my-skill',
        description: 'a skill',
        tags: '',
        doc_markdown: '# My Skill\nHello',
      };
      const req = { user: { id: 'u1', name: 'Tester', email: 'test@test.com' } } as any;
      const res = { redirect: jest.fn() } as any;

      await controller.createItem(body, undefined, req, res);

      expect(mockItemsService.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Skill',
          installActions: { claude_code: { notes: '# My Skill\nHello' } },
        }),
      );
    });

    it('should use uploaded .md file for Skill doc_markdown', async () => {
      mockItemsService.createItem.mockResolvedValue({
        ...mockSkillItem,
        itemId: 'skill-new',
      });
      const file = { buffer: Buffer.from('# From file') } as Express.Multer.File;
      const body = { type: 'Skill', name: 'x', description: 'y', tags: '' };
      const req = { user: null } as any;
      const res = { redirect: jest.fn() } as any;

      await controller.createItem(body, file, req, res);

      expect(mockItemsService.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          installActions: { claude_code: { notes: '# From file' } },
        }),
      );
    });

    it('should save short/ detail descriptions separately', async () => {
      mockItemsService.createItem.mockResolvedValue({
        ...mockItem,
        itemId: 'new-id',
      });
      const body = {
        type: 'MCP',
        name: 'x',
        description: 'short text',
        detailDescription: 'detail text',
        tags: '',
      };
      const req = { user: null } as any;
      const res = { redirect: jest.fn() } as any;

      await controller.createItem(body, undefined, req, res);

      expect(mockItemsService.createItem).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'short text',
          detailDescription: 'detail text',
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
