import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { engine } from 'express-handlebars';
import * as session from 'express-session';
import * as passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const viewsDir = join(__dirname, '..', 'views');

  // Handlebars view engine with layout support
  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      layoutsDir: join(viewsDir, 'layouts'),
      defaultLayout: 'main',
      partialsDir: join(viewsDir, 'partials'),
      helpers: {
        ifEq: function (this: any, a: unknown, b: unknown, options: any) {
          if (a === b) return options.fn(this);
          return options.inverse(this);
        },
        join: function (...args: any[]) {
          args.pop(); // remove Handlebars options object
          const arr = args[0];
          const sep = args[1] || ', ';
          if (!Array.isArray(arr)) return '';
          return arr.join(sep);
        },
        hasTag: function (tags: unknown, tag: unknown) {
          if (!Array.isArray(tags)) return false;
          return tags.includes(tag);
        },
      },
    }),
  );
  app.setBaseViewsDir(viewsDir);
  app.setViewEngine('hbs');

  // Static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Trust first proxy (ngrok, ALB, etc.) so req.secure works behind HTTPS
  app.set('trust proxy', 1);

  // Session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'local-dev-secret',
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
        secure: 'auto', // true when behind HTTPS proxy
      },
    }),
  );

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Make user available in all templates via res.locals
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.user = req.user || null;
    next();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
}
bootstrap();
