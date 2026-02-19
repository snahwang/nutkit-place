import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './google-auth.guard';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    if (req.session) {
      req.session.save(() => res.redirect('/'));
    } else {
      res.redirect('/');
    }
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      res.redirect('/');
    });
  }

  @Get('whoami')
  whoami(@Req() req: Request) {
    return {
      authenticated: req.isAuthenticated(),
      user: req.user || null,
    };
  }
}
