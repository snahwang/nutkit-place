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
      // Extra session/proxy diagnostics (safe; no secrets)
      sessionID: (req as any).sessionID,
      hasSession: Boolean((req as any).session),
      secure: (req as any).secure,
      protocol: (req as any).protocol,
      xForwardedProto: req.headers['x-forwarded-proto'] || null,
      cookieHeaderPresent: Boolean(req.headers.cookie),
    };
  }

  /**
   * Session cookie diagnostic (no auth). Use this to confirm cookies persist behind ngrok/basic-auth.
   */
  @Get('session-test')
  sessionTest(@Req() req: Request) {
    const session: any = (req as any).session;
    if (!session) {
      return { ok: false, reason: 'no session middleware', sessionID: (req as any).sessionID };
    }
    session.counter = (session.counter || 0) + 1;
    return {
      ok: true,
      counter: session.counter,
      sessionID: (req as any).sessionID,
      secure: (req as any).secure,
      protocol: (req as any).protocol,
      xForwardedProto: req.headers['x-forwarded-proto'] || null,
      cookieHeaderPresent: Boolean(req.headers.cookie),
    };
  }
}
