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
  // Share the photograph itself, not a generated card: no crop, resize,
  // padding or background canvas. Large PNGs are losslessly sourced and only
  // re-encoded to JPEG for wide compatibility with social link crawlers.
  const output = join(target, `${slug}-portrait.jpg`);
  const original = await sharp(sourceFile).metadata();
  await sharp(sourceFile).rotate()
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(output);
  const metadata = await sharp(output).metadata();
  const rotated = [6, 8].includes(original.orientation ?? 1);
  const expectedWidth = rotated ? original.height : original.width;
  const expectedHeight = rotated ? original.width : original.height;
  if (!metadata.width || !metadata.height || metadata.width !== expectedWidth || metadata.height !== expectedHeight) {
    throw new Error(`Executive portrait preview changed original dimensions: ${slug}`);
  }
  console.log(`Prepared executive preview ${slug}.jpg`);
}
