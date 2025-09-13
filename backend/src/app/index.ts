// entry point
import Fastify from 'fastify';
import { initializeApp } from './providers';
import { PORT } from '../shared/config';

const fastify = Fastify({
  logger: {
    level: 'info'
  }
});

const start = async () => {
  try {
    await initializeApp(fastify);
    
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
