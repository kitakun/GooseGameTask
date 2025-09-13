import { FastifyRequest, FastifyReply } from "fastify";

export type AuthenticatedRequest = FastifyRequest & {
  user?: {
    id: string;
    username: string;
    role: string;
  };
};

export type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  message?: string;
};

export type MiddlewareFunction = (
  request: AuthenticatedRequest,
  reply: FastifyReply
) => Promise<void>;
