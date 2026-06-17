import Fastify from "fastify";
import cors from "@fastify/cors";
import fs from "fs";
import path from "path";
import { exiftool } from "exiftool-vendored";

// Import our modular endpoint plugin routes
import foldersRoute from "./routes/folders";
import imagesBatchRoute from "./routes/imagesBatch";
import streamRoute from "./routes/stream";

const fastify = Fastify({ logger: false });
const PORT = 3000;
const SETTINGS_FILE = path.join(__dirname, "../settings.json");

const folderIdToPath = new Map<string, string>();
const folderPathToId = new Map<string, string>();
const imageIdToPath = new Map<string, string>();

function loadWatchPaths(): string[] {
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify({ watchPaths: [] }, null, 2),
    );
    return [];
  }
  try {
    const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return (JSON.parse(data).watchPaths || []).map((p: string) =>
      path.normalize(p.trim()),
    );
  } catch {
    return [];
  }
}

async function findImageDirectories(
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

fastify.register(cors, { origin: "*" });

// Register separate route files and inject options references
fastify.register(foldersRoute, {
  SETTINGS_FILE,
  loadWatchPaths,
  findImageDirectories,
  folderPathToId,
  folderIdToPath,
});
fastify.register(imagesBatchRoute, {
  PORT,
  folderIdToPath,
  imageIdToPath,
});
fastify.register(streamRoute, {
  imageIdToPath,
});

fastify.addHook("onClose", async () => {
  await exiftool.end();
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT });
    console.log(
      `🚀 Advanced HDR Metadata Engine running at http://localhost:3000`,
    );
  } catch (err) {
    process.exit(1);
  }
};
start();
