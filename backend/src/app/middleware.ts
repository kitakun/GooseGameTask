import { FastifyInstance } from "fastify";
import { authenticateToken, requireAdmin } from "../shared/lib/middleware";

export const registerMiddleware = (fastify: FastifyInstance) => {
  fastify.decorate("authenticate", authenticateToken);
  fastify.decorate("requireAdmin", requireAdmin);
};
