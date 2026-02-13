import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as hbs from 'hbs';
import { AppModule } from './app.module';
import { registerHbsHelpers } from './hbs.helpers';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const viewsDir = join(__dirname, '..', 'views');

  // Handlebars view engine with layout support
  app.setBaseViewsDir(viewsDir);
  app.setViewEngine('hbs');

  // Register partials directory (layouts act as partials in hbs)
  hbs.registerPartials(join(viewsDir, 'layouts'));

  // Register custom helpers
  registerHbsHelpers();

  // Static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
}
bootstrap();
