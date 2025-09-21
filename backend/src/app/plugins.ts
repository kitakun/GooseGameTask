import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { FRONTEND_URL, JWT_SECRET } from "../shared/config";

export const registerPlugins = async (fastify: FastifyInstance) => {
  await fastify.register(cors, {
    origin: FRONTEND_URL,
    credentials: true,
  });

  await fastify.register(cookie, {
    secret: JWT_SECRET,
  });
};
