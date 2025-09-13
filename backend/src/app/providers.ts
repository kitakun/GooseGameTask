import { FastifyInstance } from 'fastify';
import { registerPlugins } from './plugins';
import { registerMiddleware } from './middleware';
import { registerRoutes } from './routes';

export const initializeApp = async (fastify: FastifyInstance) => {
  await registerPlugins(fastify);
  registerMiddleware(fastify);
  await registerRoutes(fastify);
};
