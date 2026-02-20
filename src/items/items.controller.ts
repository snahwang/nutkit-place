import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Res,
  Render,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ItemsService, InstallActions, ItemRecord } from './items.service';
import { TagsService } from '../tags/tags.service';
import { LoginGuard, ApiAuthGuard } from '../auth/authenticated.guard';

const ADMIN_EMAIL = 'sonar@zigbang.com';
const EMOJI_PRESETS = ['🔧','🔌','🤖','💬','📦','🔍','💳','🔐','📊','🚀','📝','🧪','🎨','📡','⚙️'];

@Controller()
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly tagsService: TagsService,
  ) {}

  /* ── helpers ──────────────────────────────────────── */

  private canUserEdit(
    user: Express.User | undefined,
    item: ItemRecord,
  ): boolean {
    if (!user) return false;
    if (user.email === ADMIN_EMAIL) return true;
    return user.email === item.authorEmail;
  }

  private parseInstallActions(body: Record<string, any>): InstallActions {
    const actions: InstallActions = {};
    if (
      body.claude_code_command ||
      body.claude_code_url ||
      body.claude_code_path ||
      body.claude_code_notes
    ) {
      actions.claude_code = {
        ...(body.claude_code_command && { command: body.claude_code_command }),
        ...(body.claude_code_url && { url: body.claude_code_url }),
        ...(body.claude_code_path && { path: body.claude_code_path }),
        ...(body.claude_code_notes && { notes: body.claude_code_notes }),
      };
    }
    if (
      body.cursor_command ||
      body.cursor_url ||
      body.cursor_path ||
      body.cursor_notes
    ) {
      actions.cursor = {
        ...(body.cursor_command && { command: body.cursor_command }),
        ...(body.cursor_url && { url: body.cursor_url }),
        ...(body.cursor_path && { path: body.cursor_path }),
        ...(body.cursor_notes && { notes: body.cursor_notes }),
      };
    }
    return actions;
  }

  private parseTags(raw: unknown): string[] {
    if (Array.isArray(raw)) {
      return raw
        .map((t: any) => String(t).trim().toLowerCase())
        .filter(Boolean);
    }
    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }
    return [];
  }

  private async validateTags(raw: unknown): Promise<string[]> {
    const parsed = this.parseTags(raw);
    const knownIds = await this.tagsService.getAllKnownTagIds();
    return parsed.filter((t) => knownIds.has(t));
  }

  /* ── SSR routes ──────────────────────────────────── */

  @Get('items/new')
  @UseGuards(LoginGuard)
  @Render('items/new')
  async getNewForm(@Req() req: Request) {
    const tagGroups = await this.tagsService.getTagGroups();
    return {
      title: 'Register New Item',
      user: (req as any).user || null,
      tagGroups,
      emojiPresets: EMOJI_PRESETS,
    };
  }

  @Get('items/:id')
  async getDetail(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const item = await this.itemsService.getItemById(id);
    if (!item) {
      return res.status(404).render('error', {
        statusCode: 404,
        message: 'Item not found',
        title: 'Not Found',
      });
    }
    const user = req.user as Express.User | undefined;
    const starred = user
      ? await this.itemsService.hasUserStarred(user.id, id)
      : false;
    const hasInstallActions =
      item.installActions &&
      (item.installActions.claude_code || item.installActions.cursor);
    const canEdit = this.canUserEdit(user, item);
    return res.render('items/detail', {
      title: item.name,
      item,
      hasInstallActions,
      starred,
      canEdit,
    });
  }

  @Get('items/:id/edit')
  @UseGuards(LoginGuard)
  async getEditForm(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const item = await this.itemsService.getItemById(id);
    if (!item) {
      return res.status(404).render('error', {
        statusCode: 404,
        message: 'Item not found',
        title: 'Not Found',
      });
    }
    if (!this.canUserEdit(req.user as Express.User | undefined, item)) {
      return res.status(403).render('error', {
        statusCode: 403,
        message: 'Permission denied',
        title: 'Forbidden',
      });
    }
    const tagGroups = await this.tagsService.getTagGroups();
    return res.render('items/edit', {
      title: `Edit ${item.name}`,
      item,
      tagGroups,
      emojiPresets: EMOJI_PRESETS,
    });
  }

  /* ── API routes ──────────────────────────────────── */

  @Post('api/items')
  @UseGuards(LoginGuard)
  @UseInterceptors(FileInterceptor('mdFile'))
  async createItem(
    @Body() body: Record<string, any>,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user;
    let detailDescription = body.detailDescription || '';
    if (file) {
      detailDescription = file.buffer.toString('utf-8');
    }

    const tags = await this.validateTags(body.tags);

    const item = await this.itemsService.createItem({
      type: body.type,
      name: body.name,
      description: body.description,
      detailDescription,
      tags,
      installActions: this.parseInstallActions(body),
      githubUrl: body.githubUrl || '',
      icon: body.icon || '',
      authorId: user?.id || '',
      authorName: user?.name || 'Anonymous',
      authorEmail: user?.email || '',
    });

    res.redirect(`/items/${item.itemId}`);
  }

  @Post('api/items/:id')
  @UseGuards(LoginGuard)
  @UseInterceptors(FileInterceptor('mdFile'))
  async updateItem(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const existing = await this.itemsService.getItemById(id);
    if (!existing) {
      return res.status(404).render('error', {
        statusCode: 404,
        message: 'Item not found',
        title: 'Not Found',
      });
    }
    if (!this.canUserEdit(req.user as Express.User | undefined, existing)) {
      return res.status(403).render('error', {
        statusCode: 403,
        message: 'Permission denied',
        title: 'Forbidden',
      });
    }

    let detailDescription: string | undefined = body.detailDescription;
    if (file) {
      detailDescription = file.buffer.toString('utf-8');
    }

    const tags = await this.validateTags(body.tags);

    const item = await this.itemsService.updateItem(id, {
      type: body.type,
      name: body.name,
      description: body.description,
      detailDescription,
      tags,
      installActions: this.parseInstallActions(body),
      githubUrl: body.githubUrl || '',
      icon: body.icon || '',
    });

    if (!item) {
      return res.status(404).render('error', {
        statusCode: 404,
        message: 'Item not found',
        title: 'Not Found',
      });
    }
    res.redirect(`/items/${item.itemId}`);
  }

  @Post('api/items/:id/delete')
  @UseGuards(LoginGuard)
  async deleteItem(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const item = await this.itemsService.getItemById(id);
    if (!item) {
      return res.status(404).render('error', {
        statusCode: 404,
        message: 'Item not found',
        title: 'Not Found',
      });
    }
    if (!this.canUserEdit(req.user as Express.User | undefined, item)) {
      return res.status(403).render('error', {
        statusCode: 403,
        message: 'Permission denied',
        title: 'Forbidden',
      });
    }
    await this.itemsService.deleteItem(id);
    res.redirect('/');
  }

  @Post('api/items/:id/star')
  @UseGuards(ApiAuthGuard)
  async toggleStar(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as Express.User;
    return this.itemsService.toggleStar(user.id, id);
  }
}
