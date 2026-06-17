import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fs from "fs";
import path from "path";
import crypto from "crypto";

interface FoldersRouteOptions {
  SETTINGS_FILE: string;
  loadWatchPaths: () => string[];
  findImageDirectories: (dir: string, foundDirs: Set<string>) => Promise<void>;
  folderPathToId: Map<string, string>;
  folderIdToPath: Map<string, string>;
}

export default fp(async function (
  fastify: FastifyInstance,
  opts: FoldersRouteOptions,
) {
  fastify.get("/api/folders", async (request, reply) => {
    const rootPaths = opts.loadWatchPaths();
    const validDirectories = new Set<string>();

    await Promise.all(
      rootPaths.map((root) =>
        opts.findImageDirectories(root, validDirectories),
      ),
    );

    let slideshowInterval = 30;
    try {
      const data = fs.readFileSync(opts.SETTINGS_FILE, "utf-8");
      const parsedConfig = JSON.parse(data); // Changed variable name away from reserved words
      if (typeof parsedConfig.slideshowIntervalSeconds === "number") {
        slideshowInterval = parsedConfig.slideshowIntervalSeconds;
      }
    } catch {}

    const folderPayload = Array.from(validDirectories).map((fullPath) => {
      let id = opts.folderPathToId.get(fullPath);
      if (!id) {
        id = crypto.createHash("md5").update(fullPath).digest("hex");
        opts.folderPathToId.set(fullPath, id);
        opts.folderIdToPath.set(id, fullPath);
      }

      const parentRoot =
        rootPaths.find((root) => fullPath.startsWith(path.resolve(root))) || "";
      return {
        id,
        name: parentRoot ? path.relative(parentRoot, fullPath) : fullPath,
        groupKey: parentRoot || "Other Locations",
      };
    });

    folderPayload.sort((a, b) => {
      // Extract the first sequence of numbers found in the folder name
      const matchA = a.name.match(/\d+/);
      const matchB = b.name.match(/\d+/);

      // Fallback to standard alphabetical comparison if no numbers exist
      if (!matchA || !matchB) return a.name.localeCompare(b.name);

      const numA = parseInt(matchA[0], 10);
      const numB = parseInt(matchB[0], 10);

      // Compare the extracted launch years numerically
      if (numA !== numB) {
        return numA - numB;
      }

      return a.name.localeCompare(b.name);
    });

    return {
      folders: folderPayload,
      slideshowIntervalSeconds: slideshowInterval,
    };
  });
});
