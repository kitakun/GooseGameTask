import { FastifyInstance } from "fastify";
import { LoginRequest } from "./types";
import { generateToken } from "../lib/utils";
import { userService } from "@/domain/user/api";
import { NODE_ENV } from "@/shared/config";

export const authController = async (fastify: FastifyInstance) => {
  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body as LoginRequest;

      try {
        let user = await userService.verifyUser(username, password);

        if (!user) {
          user = await userService.createUser(username, password);
        }

        const token = generateToken(user);

        reply.setCookie("token", token, {
          httpOnly: true,
          secure: NODE_ENV === "production",
          sameSite: "lax",
          // 7 days
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
          user,
          token,
        };
      } catch (error) {
        reply.status(500).send({ error: "Internal server error" });
        return;
      }
    }
  );

  fastify.post("/logout", async (_, reply) => {
    reply.clearCookie("token");
    return { message: "Logged out successfully" };
  });

  fastify.get(
    "/me",
    {
      preHandler: [fastify.authenticate],
    },
    async (request: any) => {
      return {
        user: request.user,
      };
    }
  );
};
