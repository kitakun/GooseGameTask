import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { UserRole } from "@/entities/user/model";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      username: string;
      role: UserRole;
    };
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    requireAdmin: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}
