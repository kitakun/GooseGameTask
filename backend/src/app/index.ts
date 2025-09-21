/// <reference path="../types/fastify.d.ts" />
import Fastify from "fastify";
import { initializeApp } from "./providers";
import { PORT } from "../shared/config";
import { roundSnapshotJob } from "../shared/lib/jobs/snapshotJob";
import { servicesManager } from "../shared/lib/distributedServices";

const fastify = Fastify({
  logger: {
    level: "info",
  },
});

const start = async () => {
  try {
    await servicesManager.initialize();

    await initializeApp(fastify);

    roundSnapshotJob.start(60000);

    const gracefulShutdown = async () => {
      roundSnapshotJob.stop();
      await servicesManager.shutdown();
      await fastify.close();
      process.exit(0);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    await fastify.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();