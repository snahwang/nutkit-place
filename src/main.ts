import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { engine } from 'express-handlebars';
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
        ifEq(a: unknown, b: unknown) {
          return a === b;
        },
      },
    }),
  );
  app.setBaseViewsDir(viewsDir);
  app.setViewEngine('hbs');

  // Static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
}
bootstrap();
