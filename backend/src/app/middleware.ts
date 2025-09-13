import { FastifyInstance } from 'fastify';
import { authenticateToken, requireAdmin } from '../features/auth/lib/middleware';

export const registerMiddleware = (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', authenticateToken);
  fastify.decorate('requireAdmin', requireAdmin);
};
