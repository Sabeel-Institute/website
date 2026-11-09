/**
 * Makes a program's 16:9 image (image.webp, 1920 × 1080 px) from the title
 * area of its flyer (flyer.webp), for a program that has no artwork of its
 * own (see Program images in AGENTS.md).
 *
 *   npm run program-image -- <folder> <top> <bottom> [centre]
 *
 * <top> and <bottom> are where the title area starts and ends, in percent of
 * the flyer's height from its top edge; [centre] is the middle of the image
 * in percent of the flyer's width (default 50). The image takes those rows,
 * as wide as 16:9 needs. When the flyer is narrower than that, its edges are
 * drawn out sideways and blurred, so nothing in the title area is cut.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const USAGE = 'Usage: npm run program-image -- <folder> <top> <bottom> [centre], e.g. npm run program-image -- anchored-hearts 0 34';
/** The image's size; the build checks that it is 16:9. */
const OUT = { width: 1920, height: 1080 };
/** Rows fewer than this would be enlarged more than 1.5 times and look soft. */
const MIN_ROWS = 720;

function fail(message) {
  console.error(`program-image: ${message}\n${USAGE}`);
  process.exit(1);
}

function percent(name, value, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  if (value === undefined || !/^\d+(\.\d+)?$/.test(value) || +value > 100) fail(`${name} is a number from 0 to 100 (percent), not "${value ?? ''}"`);
  return +value;
}

const [folder, topArg, bottomArg, centreArg, ...extra] = process.argv.slice(2);
if (!folder || extra.length) fail('give a program folder and where its title area starts and ends');
const dir = join('src/content/programs', folder);
const flyer = join(dir, 'flyer.webp');
if (!existsSync(dir)) fail(`there is no program folder ${dir}; run this from the repository root with the folder's name`);
if (!existsSync(flyer)) fail(`${dir} has no flyer.webp; add the flyer first (see Program images in AGENTS.md)`);
const top = percent('top', topArg);
const bottom = percent('bottom', bottomArg);
const centre = percent('centre', centreArg, 50);
if (bottom <= top) fail(`bottom (${bottom}) is below top (${top}): both are measured from the flyer's top edge`);

const { width: W, height: H } = await sharp(flyer).metadata();
const y = Math.round((top / 100) * H);
const h = Math.round(((bottom - top) / 100) * H);
if (h < MIN_ROWS) {
  fail(`rows ${top}–${bottom}% are only ${h} px of the flyer, too few for a sharp ${OUT.width} × ${OUT.height} image: choose more rows, or ask for a larger flyer`);
}
const w = Math.round((h * 16) / 9);

let frame;
if (w <= W) {
  const x = Math.min(Math.max(Math.round((centre / 100) * W - w / 2), 0), W - w);
  frame = sharp(flyer).extract({ left: x, top: y, width: w, height: h });
} else {
  const band = await sharp(flyer).extract({ left: 0, top: y, width: W, height: h }).toBuffer();
  // The flyer's edge columns, drawn out sideways and blurred: a soft fill with
  // no copy of the title area in it. Each step is its own pipeline, because
  // sharp runs one pipeline's operations in a fixed order, resizing once.
  const side = Math.ceil((w - W) / 2);
  const drawn = await sharp(band).extend({ left: side, right: side, extendWith: 'copy' }).toBuffer();
  // Blurred while small, which is much faster than a wide blur at full size.
  const small = await sharp(drawn).resize(Math.round(w / 8), Math.round(h / 8), { fit: 'fill' }).blur(Math.max(1, h / 100)).toBuffer();
  const sides = await sharp(small).resize(w, h, { fit: 'fill' }).toBuffer();
  frame = sharp(sides).composite([{ input: band, left: Math.round((w - W) / 2), top: 0 }]);
}

const out = join(dir, 'image.webp');
await sharp(await frame.toBuffer()).resize(OUT.width, OUT.height).webp({ quality: 90 }).toFile(out);
console.log(
  `Wrote ${out} (${OUT.width} × ${OUT.height}) from ${top}–${bottom}% of the flyer's height` +
    `${w > W ? ', with blurred sides' : `, centred at ${centre}% of its width`}.\n` +
    'Open it and check every edge: no letter, logo, or badge may touch or cross one.',
);
