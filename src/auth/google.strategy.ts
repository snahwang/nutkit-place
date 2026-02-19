import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private allowedDomain: string;

  constructor(private readonly configService: ConfigService) {
    super({
      clientID:
        configService.get<string>('GOOGLE_CLIENT_ID') || 'not-configured',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') || 'not-configured',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
    this.allowedDomain =
      configService.get<string>('GOOGLE_ALLOWED_DOMAIN') || '';
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const email: string | undefined = profile.emails?.[0]?.value;
    if (!email) {
      return done(
        new UnauthorizedException('No email in Google profile'),
        false,
      );
    }

    if (this.allowedDomain && !email.endsWith(`@${this.allowedDomain}`)) {
      return done(
        new UnauthorizedException(
          `Only @${this.allowedDomain} accounts allowed`,
        ),
        false,
      );
    }

    const user: Express.User = {
      id: profile.id,
      email,
      name: profile.displayName || email.split('@')[0],
      picture: profile.photos?.[0]?.value,
    };
    return done(null, user);
  }
}
