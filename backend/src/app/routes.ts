import { FastifyInstance } from 'fastify';
import { authController } from '../features/auth/api/controller';
import { roundsController } from '../features/rounds/api/controller';
import { adminRoundsController } from '../features/rounds/api/adminController';
import { tapController } from '../features/tap/api/controller';

export const registerRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(authController, { prefix: '/api' });
  await fastify.register(roundsController, { prefix: '/api' });
  await fastify.register(adminRoundsController, { prefix: '/api' });
  await fastify.register(tapController, { prefix: '/api' });

  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
};
