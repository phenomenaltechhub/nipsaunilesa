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
  const portrait = await sharp(sourceFile).rotate()
    .resize({ width: 1100, height: 600, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  const output = join(target, `${slug}.jpg`);
  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: "#075b46" },
  }).composite([{ input: portrait, gravity: "centre" }])
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(output);
  const metadata = await sharp(output).metadata();
  if (metadata.width !== 1200 || metadata.height !== 630) throw new Error(`Invalid social image dimensions: ${slug}`);
  console.log(`Prepared executive preview ${slug}.jpg`);
}
