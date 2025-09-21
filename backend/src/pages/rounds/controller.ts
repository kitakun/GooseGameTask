import { FastifyInstance } from "fastify";
import { roundService } from "@/pages/rounds/eventSourcedApi";
import { AuthenticatedRequest } from "@/shared/api/types";

export const roundsController = async (fastify: FastifyInstance) => {
  fastify.get("/rounds", async (request, reply) => {
    try {
      const rounds = await roundService.getRounds();
      return { rounds };
    } catch (error) {
      reply.status(500).send({ error: "Internal server error" });
      return;
    }
  });

  fastify.get(
    "/rounds/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };

      try {
        const round = await roundService.getRoundWithStats(
          id,
          request.user?.id,
        );

        if (!round) {
          reply.status(404).send({ error: "Round not found" });
          return;
        }

        return { round };
      } catch (error) {
        reply.status(500).send({ error: "Internal server error" });
        return;
      }
    },
  );
};
