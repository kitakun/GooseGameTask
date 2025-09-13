import { FastifyInstance } from 'fastify';
import { authenticateToken, requireAdmin } from '../../features/auth/lib/middleware';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticateToken;
    requireAdmin: typeof requireAdmin;
  }
}
