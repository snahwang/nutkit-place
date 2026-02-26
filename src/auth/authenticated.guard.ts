import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

function isAuthRequired(configService: ConfigService): boolean {
  const val = configService.get<string>('AUTH_REQUIRED') ?? 'true';
  return val !== 'false' && val !== '0';
}

const ANON_USER: Express.User = {
  id: 'anon',
  email: 'anon@local',
  name: 'Anonymous',
};

/** For SSR pages — redirects unauthenticated users to Google login. */
@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.isAuthenticated?.()) return true;

    if (!isAuthRequired(this.configService)) {
      req.user = ANON_USER;
      return true;
    }

    const res: Response = context.switchToHttp().getResponse();
    res.redirect('/auth/google');
    return false;
  }
}

/** For JSON API routes — returns 401 for unauthenticated requests. */
@Injectable()
export class ApiAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.isAuthenticated?.()) return true;

    if (!isAuthRequired(this.configService)) {
      req.user = ANON_USER;
      return true;
    }

    throw new UnauthorizedException('Login required');
  }
}
