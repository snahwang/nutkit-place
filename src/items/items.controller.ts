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
import { ItemsService, InstallActions } from './items.service';
import { LoginGuard } from '../auth/authenticated.guard';

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /* ── helpers ──────────────────────────────────────── */

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
    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  }

  /* ── SSR routes ──────────────────────────────────── */

  @Get('items/new')
  @UseGuards(LoginGuard)
  @Render('items/new')
  getNewForm() {
    return { title: 'Register New Item' };
  }

  @Get('items/:id')
  async getDetail(@Param('id') id: string, @Res() res: Response) {
    const item = await this.itemsService.getItemById(id);
    if (!item) {
      return res
        .status(404)
        .render('error', { statusCode: 404, message: 'Item not found', title: 'Not Found' });
    }
    this.itemsService.incrementViewCount(id);
    const hasInstallActions =
      item.installActions &&
      (item.installActions.claude_code || item.installActions.cursor);
    return res.render('items/detail', { title: item.name, item, hasInstallActions });
  }

  @Get('items/:id/edit')
  @UseGuards(LoginGuard)
  async getEditForm(@Param('id') id: string, @Res() res: Response) {
    const item = await this.itemsService.getItemById(id);
    if (!item) {
      return res
        .status(404)
        .render('error', { statusCode: 404, message: 'Item not found', title: 'Not Found' });
    }
    return res.render('items/edit', { title: `Edit ${item.name}`, item });
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

    const item = await this.itemsService.createItem({
      type: body.type,
      name: body.name,
      description: body.description,
      detailDescription,
      tags: this.parseTags(body.tags),
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
    @Res() res: Response,
  ) {
    let detailDescription: string | undefined = body.detailDescription;
    if (file) {
      detailDescription = file.buffer.toString('utf-8');
    }

    const item = await this.itemsService.updateItem(id, {
      type: body.type,
      name: body.name,
      description: body.description,
      detailDescription,
      tags: this.parseTags(body.tags),
      installActions: this.parseInstallActions(body),
      githubUrl: body.githubUrl || '',
      icon: body.icon || '',
    });

    if (!item) {
      return res
        .status(404)
        .render('error', { statusCode: 404, message: 'Item not found', title: 'Not Found' });
    }
    res.redirect(`/items/${item.itemId}`);
  }

  @Post('api/items/:id/delete')
  @UseGuards(LoginGuard)
  async deleteItem(@Param('id') id: string, @Res() res: Response) {
    await this.itemsService.deleteItem(id);
    res.redirect('/');
  }
}
