import {
  inMemoryLockService,
  inMemoryCacheService,
} from "./cache/inMemoryServices";

class ServicesManager {
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    console.log("Using in-memory services");
    this.isInitialized = true;
  }

  async shutdown(): Promise<void> {
    console.log("In-memory services shutdown (no action needed)");
    this.isInitialized = false;
  }

  async healthCheck(): Promise<{
    locks: boolean;
    cache: boolean;
    overall: boolean;
  }> {
    const [inMemoryLocks, inMemoryCache] = await Promise.all([
      inMemoryLockService.ping(),
      inMemoryCacheService.ping(),
    ]);

    return {
      locks: inMemoryLocks,
      cache: inMemoryCache,
      overall: inMemoryLocks && inMemoryCache,
    };
  }

  getStatus(): { initialized: boolean; services: string[] } {
    return {
      initialized: this.isInitialized,
      services: ["inMemoryLockService", "inMemoryCacheService"],
    };
  }
}

const servicesManager = new ServicesManager();

process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down services...");
  await servicesManager.shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down services...");
  await servicesManager.shutdown();
  process.exit(0);
});

export { servicesManager };
