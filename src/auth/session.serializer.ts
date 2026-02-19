import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: Express.User,
    done: (err: Error | null, user: Express.User) => void,
  ) {
    done(null, user);
  }

  deserializeUser(
    payload: Express.User,
    done: (err: Error | null, payload: Express.User) => void,
  ) {
    done(null, payload);
  }
}
