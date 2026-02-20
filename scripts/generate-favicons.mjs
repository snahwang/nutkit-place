#!/usr/bin/env node
import { Jimp } from 'jimp';
import toIco from 'to-ico';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'assets', 'logo-source.jpg');
const pub = join(root, 'public');

async function generate() {
  const img = await Jimp.read(src);

  // Make square crop (center) before resizing
  const size = Math.min(img.width, img.height);
  const x = Math.floor((img.width - size) / 2);
  const y = Math.floor((img.height - size) / 2);
  img.crop({ x, y, w: size, h: size });

  // Apple touch icon 180x180
  const apple = img.clone().resize({ w: 180, h: 180 });
  const appleBuf = await apple.getBuffer('image/png');
  writeFileSync(join(pub, 'apple-touch-icon.png'), appleBuf);
  console.log('apple-touch-icon.png (180x180)');

  // 32x32
  const f32 = img.clone().resize({ w: 32, h: 32 });
  const buf32 = await f32.getBuffer('image/png');
  writeFileSync(join(pub, 'favicon-32x32.png'), buf32);
  console.log('favicon-32x32.png');

  // 16x16
  const f16 = img.clone().resize({ w: 16, h: 16 });
  const buf16 = await f16.getBuffer('image/png');
  writeFileSync(join(pub, 'favicon-16x16.png'), buf16);
  console.log('favicon-16x16.png');

  // 48x48 for ico
  const f48 = img.clone().resize({ w: 48, h: 48 });
  const buf48 = await f48.getBuffer('image/png');

  // favicon.ico from 16, 32, 48
  const ico = await toIco([buf16, buf32, buf48]);
  writeFileSync(join(pub, 'favicon.ico'), ico);
  console.log('favicon.ico (16/32/48)');

  console.log('Done!');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
