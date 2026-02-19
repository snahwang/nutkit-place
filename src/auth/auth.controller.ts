import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() _req: Request, @Res() res: Response) {
    res.redirect('/');
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      res.redirect('/');
    });
  }
}
