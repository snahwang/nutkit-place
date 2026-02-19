import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

/** For SSR pages — redirects unauthenticated users to Google login. */
@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.isAuthenticated?.()) return true;

    const res: Response = context.switchToHttp().getResponse();
    res.redirect('/auth/google');
    return false;
  }
}

/** For JSON API routes — returns 401 for unauthenticated requests. */
@Injectable()
export class ApiAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.isAuthenticated?.()) return true;
    throw new UnauthorizedException('Login required');
  }
}
