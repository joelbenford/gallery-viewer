import fs from "fs";
import path from "path";

/**
 * Asynchronously checks directories to find case-insensitive matching picture extensions
 */
export async function findImageDirectories(
  dir: string,
  foundDirs: Set<string>,
): Promise<void> {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    let containsTargetImages = false;

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await findImageDirectories(fullPath, foundDirs);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if ([".jpg", ".jpeg", ".avif", ".png"].includes(ext)) {
          containsTargetImages = true;
        }
      }
    }

    if (containsTargetImages) {
      foundDirs.add(path.resolve(dir));
    }
  } catch (err) {
    console.warn(`⚠️ Skipping inaccessible directory path: ${dir}`);
  }
}
