import { FastifyInstance } from "fastify";
import { authController } from "../pages/auth/controller";
import { roundsController } from "../pages/rounds/controller";
import { adminRoundsController } from "../pages/rounds/adminController";
import { tapController } from "../pages/tap/controller";
import { servicesManager } from "../shared/lib/distributedServices";

export const registerRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(authController, { prefix: "/api" });
  await fastify.register(roundsController, { prefix: "/api" });
  await fastify.register(adminRoundsController, { prefix: "/api" });
  await fastify.register(tapController, { prefix: "/api" });

  fastify.get("/health", async () => {
    const servicesHealth = await servicesManager.healthCheck();
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: servicesHealth,
    };
  });

  fastify.get("/health/services", async () => {
    const health = await servicesManager.healthCheck();
    const status = servicesManager.getStatus();
    return {
      ...health,
      ...status,
      timestamp: new Date().toISOString(),
    };
  });
};