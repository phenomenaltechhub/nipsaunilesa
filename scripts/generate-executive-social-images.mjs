import { mkdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(".");
const source = await readFile(join(root, "app/executives/data.ts"), "utf8");
const records = [...source.matchAll(/\bslug:\s*"([^"]+)"[\s\S]*?\bimage:\s*"([^"]+)"/g)];
if (!records.length) throw new Error("No executive image records were found");

const target = join(root, "public/social/executives");
await mkdir(target, { recursive: true });

for (const [, slug, image] of records) {
  if (!/^[a-z0-9-]+$/.test(slug) || !/^\/images\/[\w .-]+\.(?:png|jpe?g|webp)$/i.test(image)) {
    throw new Error(`Unexpected executive social image reference: ${slug}: ${image}`);
  }
  const sourceFile = join(root, "public", image.slice(1));
  // Preserve the original portrait's framing and aspect ratio for social crawlers.
  // Do not surround vertical portraits with a wide green canvas or upscale small photos.
  const output = join(target, `${slug}-portrait.jpg`);
  await sharp(sourceFile).rotate()
    .resize({ width: 1000, height: 1200, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(output);
  const metadata = await sharp(output).metadata();
  if (!metadata.width || !metadata.height || metadata.width > 1000 || metadata.height > 1200) {
    throw new Error(`Invalid portrait preview dimensions: ${slug}`);
  }
  console.log(`Prepared executive preview ${slug}.jpg`);
}
