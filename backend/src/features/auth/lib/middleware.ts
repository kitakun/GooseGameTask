import { MiddlewareFunction } from "@/shared/api/types";
import { verifyToken } from "./utils";
import { userService } from "@/domain/user/api";

export const authenticateToken: MiddlewareFunction = async (request, reply) => {
  const token =
    request.cookies?.["token"] ||
    request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    reply.status(401).send({ error: "Access token required" });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    reply.status(401).send({ error: "Invalid token" });
    return;
  }

  const user = await userService.getUserById(decoded.id);
  if (!user) {
    reply.status(401).send({ error: "User not found" });
    return;
  }

  request.user = {
    id: user.id,
    username: user.username,
    role: user.role,
  };
};

export const requireAdmin: MiddlewareFunction = async (request, reply) => {
  if (!request.user || request.user.role !== "ADMIN") {
    reply.status(403).send({ error: "Admin access required" });
    return;
  }
};
