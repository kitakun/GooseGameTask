import { FastifyRequest, FastifyReply } from "fastify";
import { UserRole } from "@/entities/user/model";

export type AuthenticatedRequest = FastifyRequest & {
  user?: {
    id: string;
    username: string;
    role: UserRole;
  };
};

export type MiddlewareFunction = (
  request: AuthenticatedRequest,
  reply: FastifyReply,
) => Promise<void>;
