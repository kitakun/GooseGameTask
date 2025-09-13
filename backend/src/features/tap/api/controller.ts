import { FastifyInstance } from "fastify";
import { tapService } from "@/domain/tap/api";
import { AuthenticatedRequest } from "@/shared/api/types";

export const tapController = async (fastify: FastifyInstance) => {
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
        const result = await tapService.processTap(
          request.user.id,
          roundId,
          request.user.role
        );

        return result;
      } catch (error) {
        if (error instanceof Error) {
          reply.status(400).send({ error: error.message });
        } else {
          reply.status(500).send({ error: "Internal server error" });
        }
        return;
      }
    }
  );
};
