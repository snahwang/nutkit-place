import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Ensure Google OAuth uses sessions (req.logIn + serializeUser) so SSR pages can read req.user.
 * We also set the OAuth scope here.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    // Force session usage; keep scope consistent.
    return {
      session: true,
      scope: ['email', 'profile'],
    } as any;
  }
}
