import { FastifyInstance } from "fastify";
import { tapService } from "@/pages/tap/eventSourcedApi";
import { AuthenticatedRequest } from "@/shared/api/types";

export const tapController = async (fastify: FastifyInstance) => {
  fastify.get(
    "/tap/stats/:roundId",
    {
      schema: {
        params: {
          type: "object",
          required: ["roundId"],
          properties: {
            roundId: { type: "string" },
          },
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request: AuthenticatedRequest, reply) => {
      if (!request.user) {
        reply.status(401).send({ error: "User not authenticated" });
        return;
      }

      const { roundId } = request.params as { roundId: string };

      try {
        const [userStats, roundStats] = await Promise.all([
          tapService.getUserTapStats(request.user.id, roundId),
          tapService.getRoundStats(roundId),
        ]);

        return {
          userStats,
          roundStats: {
            totalTaps: roundStats.totalTaps,
            totalPoints: roundStats.totalPoints,
          },
          winner: roundStats.winner,
        };
      } catch (error) {
        if (error instanceof Error) {
          reply.status(400).send({ error: error.message });
        } else {
          reply.status(500).send({ error: "Internal server error" });
        }
        return;
      }
    },
  );

  fastify.post(
    "/tap",
    {
      schema: {
        body: {
          type: "object",
          required: ["roundId"],
          properties: {
            roundId: { type: "string" },
          },
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request: AuthenticatedRequest, reply) => {
      const { roundId } = request.body as { roundId: string };

      if (!request.user) {
        reply.status(401).send({ error: "User not authenticated" });
        return;
      }

      try {
        await tapService.processTap(
          request.user.id,
          roundId,
          request.user.role,
        );

        reply.status(200).send({ success: true });
        return;
      } catch (error) {
        if (error instanceof Error) {
          reply.status(400).send({ error: error.message });
        } else {
          reply.status(500).send({ error: "Internal server error" });
        }
        return;
      }
    },
  );
};
