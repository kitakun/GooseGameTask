import { FastifyInstance } from "fastify";
import { roundService } from "@/pages/rounds/eventSourcedApi";
import { AuthenticatedRequest } from "@/shared/api/types";

export const adminRoundsController = async (fastify: FastifyInstance) => {
  fastify.post(
    "/rounds",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            startDate: { type: "string", format: "date-time" },
          },
        },
      },
      preHandler: [fastify.authenticate, fastify.requireAdmin],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { startDate } = request.body as { startDate?: string };

      try {
        const round = await roundService.createRound(
          startDate ? new Date(startDate) : undefined,
        );

        return { round };
      } catch (error) {
        reply.status(500).send({ error: "Internal server error" });
        return;
      }
    },
  );

};
