import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { exiftool } from "exiftool-vendored";
import { formatExifDate } from "../utils/formatter.js";

interface ImagesBatchRouteOptions {
  PORT: number;
  folderIdToPath: Map<string, string>;
  imageIdToPath: Map<string, string>;
}

export default fp(async function (
  fastify: FastifyInstance,
  opts: ImagesBatchRouteOptions,
) {
  fastify.post<{ Body: { folderIds: string[] } }>(
    "/api/images/batch",
    async (request, reply) => {
      const { folderIds } = request.body;
      if (!folderIds || !Array.isArray(folderIds)) {
        return reply
          .status(400)
          .send({ error: "An array of folder IDs is required." });
      }

      const supportedExtensions = [".jpg", ".jpeg", ".avif", ".png"];
      const combinedItems: any[] = [];

      for (const id of folderIds) {
        const targetDir = opts.folderIdToPath.get(id);
        if (!targetDir || !fs.existsSync(targetDir)) continue;

        try {
          const dirStats = await fs.promises.stat(targetDir);
          const currentDirMtime = dirStats.mtime.getTime();
          const cacheFilePath = path.join(targetDir, ".hdr_gallery_cache.json");

          if (fs.existsSync(cacheFilePath)) {
            try {
              const cacheRaw = await fs.promises.readFile(
                cacheFilePath,
                "utf-8",
              );
              const cacheData = JSON.parse(cacheRaw);

              if (
                cacheData.dirMtime === currentDirMtime &&
                Array.isArray(cacheData.items)
              ) {
                cacheData.items.forEach((item: any) => {
                  if (item.fullPathHidden) {
                    opts.imageIdToPath.set(item.id, item.fullPathHidden);
                  }
                });
                combinedItems.push(...cacheData.items);
                continue;
              }
            } catch (cacheErr) {
              console.warn(
                `⚠️ Cache file corrupted or unreadable in ${targetDir}. Regenerating...`,
              );
            }
          }

          const files = await fs.promises.readdir(targetDir);
          const filesToProcess: string[] = [];

          for (const file of files) {
            if (
              supportedExtensions.includes(path.extname(file).toLowerCase())
            ) {
              filesToProcess.push(path.join(targetDir, file));
            }
          }

          if (filesToProcess.length === 0) continue;

          const tasks = filesToProcess.map((p) => exiftool.read(p));
          const batchTagsArray = await Promise.all(tasks);

          const folderItems = filesToProcess.map((imgFullPath, index) => {
            const tags = batchTagsArray[index];
            const filename = path.basename(imgFullPath);
            const imgId = crypto
              .createHash("md5")
              .update(imgFullPath)
              .digest("hex");
            opts.imageIdToPath.set(imgId, imgFullPath);

            const actualF = tags.FocalLength
              ? parseFloat(tags.FocalLength.toString())
              : 0;
            const equivF = tags.FocalLengthIn35mmFormat
              ? parseFloat(tags.FocalLengthIn35mmFormat.toString())
              : undefined;
            const focalStr = actualF
              ? equivF && equivF !== actualF
                ? `${actualF} mm (equiv: ${equivF} mm)`
                : `${actualF} mm`
              : "Unknown";

            let shutterStr = "Unknown";
            //if (index === 0) console.log(tags);
            if (tags.ExposureTime) {
              let exp: number | undefined;
              const rawStr = tags.ExposureTime.toString();

              if (typeof tags.ExposureTime === "number") {
                exp = tags.ExposureTime;
              } else if (rawStr.includes("/")) {
                // Handle fraction like "1/80"
                const [numerator, denominator] = rawStr.split("/");
                const num = parseFloat(numerator);
                const denom = parseFloat(denominator);
                if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
                  exp = num / denom;
                }
              } else {
                // Handle decimal string
                const parsed = parseFloat(rawStr);
                if (!isNaN(parsed)) {
                  exp = parsed;
                }
              }
              if (typeof exp === "number" && !isNaN(exp) && isFinite(exp)) {
                shutterStr = exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp}s`;
              } else if (typeof tags.ExposureTime === "string") {
                shutterStr = tags.ExposureTime;
              }
            }

            const biasNum = parseFloat(
              String(
                tags.ExposureCompensation ??
                  (tags as any).ExposureBiasValue ??
                  0,
              ),
            );
            const biasStr =
              biasNum === 0
                ? "0 EV"
                : biasNum > 0
                  ? `+${biasNum.toFixed(2)} EV`
                  : `${biasNum.toFixed(2)} EV`;

            const rRaw = tags.Rating ?? (tags as any)["RatingPercent"] ?? 0;
            let finalRating = 0;
            if (rRaw >= 1 && rRaw <= 5) finalRating = rRaw;
            else if (rRaw > 5) {
              if (rRaw >= 99) finalRating = 5;
              else if (rRaw >= 75) finalRating = 4;
              else if (rRaw >= 50) finalRating = 3;
              else if (rRaw >= 25) finalRating = 2;
              else if (rRaw > 0) finalRating = 1;
            }

            return {
              id: imgId,
              filename,
              src: `http://localhost:${opts.PORT}/api/stream?id=${imgId}`,
              fullPathHidden: imgFullPath,
              metadata: {
                taken: formatExifDate(tags.DateTimeOriginal ?? tags.CreateDate),
                model: String(tags.Model ?? "Unknown Body")
                  .replace(/\s+/g, " ")
                  .trim(),
                ...(tags.LensModel
                  ? { lens: String(tags.LensModel).replace(/\s+/g, " ").trim() }
                  : {}),
                focal: focalStr,
                aperture: tags.FNumber
                  ? `f/${parseFloat(tags.FNumber.toString()).toFixed(1)}`
                  : "Unknown",
                shutter: shutterStr,
                iso: String(
                  tags.ISO ?? (tags as any).ISOSpeedRatings ?? "Unknown",
                ).trim(),
                bias: biasStr,
                rating: finalRating,
              },
            };
          });

          await fs.promises.writeFile(
            cacheFilePath,
            JSON.stringify(
              { dirMtime: currentDirMtime, items: folderItems },
              null,
              2,
            ),
            "utf-8",
          );

          combinedItems.push(...folderItems);
        } catch (err) {
          console.error(`Failed processing directory items for ID ${id}:`, err);
        }
      }

      return combinedItems;
    },
  );
});
