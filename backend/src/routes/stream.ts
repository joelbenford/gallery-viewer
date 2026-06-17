import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fs from "fs";
import path from "path";

interface StreamRouteOptions {
  imageIdToPath: Map<string, string>;
}

export default fp(async function (
  fastify: FastifyInstance,
  opts: StreamRouteOptions,
) {
  // Fixed the syntax by clearing out the stray "colonial" keyword
  fastify.get<{ Querystring: { id: string } }>(
    "/api/stream",
    async (request, reply) => {
      const id = request.query.id;
      const filePath = opts.imageIdToPath.get(id);

      if (!filePath || !fs.existsSync(filePath)) {
        return reply
          .status(404)
          .send({ error: "Image file stream identifier not found." });
      }

      const ext = path.extname(filePath).toLowerCase();
      let contentType = "image/jpeg";
      if (ext === ".avif") contentType = "image/avif";
      if (ext === ".png") contentType = "image/png";

      reply.header("Content-Type", contentType);
      reply.header("Cache-Control", "public, max-age=31536000, immutable");
      return reply.send(fs.createReadStream(filePath));
    },
  );
});
