type LockEntry = {
  lockId: string;
  expiresAt: number;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

// В юоевом проекте нужен редис
class InMemoryLockService {
  private locks = new Map<string, LockEntry>();

  private readonly DEFAULT_TIMEOUT_MS = 2000;

  async acquireLock(
    resourceId: string,
    lockId: string,
    timeoutMs: number = this.DEFAULT_TIMEOUT_MS,
  ): Promise<boolean> {
    const now = Date.now();
    const expiresAt = now + timeoutMs;

    const existingLock = this.locks.get(resourceId);

    if (existingLock && existingLock.expiresAt > now) {
      return false;
    }

    this.locks.set(resourceId, {
      lockId,
      expiresAt,
    });

    return true;
  }

  async releaseLock(resourceId: string, lockId: string): Promise<boolean> {
    const existingLock = this.locks.get(resourceId);

    if (existingLock && existingLock.lockId === lockId) {
      this.locks.delete(resourceId);
      return true;
    }

    return false;
  }

  async withLock<T>(
    resourceId: string,
    operation: () => Promise<T>,
    lockId?: string,
    timeoutMs: number = this.DEFAULT_TIMEOUT_MS,
  ): Promise<T> {
    const actualLockId = lockId || `${Date.now()}-${Math.random()}`;

    const acquired = await this.acquireLock(
      resourceId,
      actualLockId,
      timeoutMs,
    );
    if (!acquired) {
      throw new Error(`Failed to acquire lock for resource: ${resourceId}`);
    }

    try {
      return await operation();
    } finally {
      await this.releaseLock(resourceId, actualLockId);
    }
  }

  cleanup(): void {
    const now = Date.now();
    for (const [resourceId, lock] of this.locks.entries()) {
      if (lock.expiresAt <= now) {
        this.locks.delete(resourceId);
      }
    }
  }

  async ping(): Promise<boolean> {
    return true;
  }
}

class InMemoryCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 30;

  private getKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || "cache:";
    return `${keyPrefix}${key}`;
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    const fullKey = this.getKey(key, prefix);
    const entry = this.cache.get(fullKey);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(fullKey);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(
    key: string,
    value: T,
    options: { ttl?: number; prefix?: string } = {},
  ): Promise<boolean> {
    const fullKey = this.getKey(key, options.prefix);
    const ttl = options.ttl || this.DEFAULT_TTL;
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(fullKey, {
      value,
      expiresAt,
    });

    return true;
  }

  async del(key: string, prefix?: string): Promise<boolean> {
    const fullKey = this.getKey(key, prefix);
    return this.cache.delete(fullKey);
  }

  async exists(key: string, prefix?: string): Promise<boolean> {
    const fullKey = this.getKey(key, prefix);
    const entry = this.cache.get(fullKey);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(fullKey);
      return false;
    }

    return true;
  }

  async ttl(key: string, prefix?: string): Promise<number> {
    const fullKey = this.getKey(key, prefix);
    const entry = this.cache.get(fullKey);

    if (!entry) {
      return -1;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(fullKey);
      return -1;
    }

    return Math.ceil((entry.expiresAt - Date.now()) / 1000);
  }

  async expire(key: string, ttl: number, prefix?: string): Promise<boolean> {
    const fullKey = this.getKey(key, prefix);
    const entry = this.cache.get(fullKey);

    if (!entry) {
      return false;
    }

    entry.expiresAt = Date.now() + ttl * 1000;
    return true;
  }

  async clear(prefix?: string): Promise<boolean> {
    if (prefix) {
      const pattern = this.getKey("", prefix);
      for (const key of this.cache.keys()) {
        if (key.startsWith(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }

    return true;
  }

  async getStats(): Promise<{
    memory: string;
    keys: number;
    connected: boolean;
  }> {
    return {
      memory: "in-memory",
      keys: this.cache.size,
      connected: true,
    };
  }

  async ping(): Promise<boolean> {
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }
}

const inMemoryLockService = new InMemoryLockService();
const inMemoryCacheService = new InMemoryCacheService();

setInterval(() => {
  inMemoryLockService.cleanup();
  inMemoryCacheService.cleanup();
}, 30000);

export { inMemoryLockService, inMemoryCacheService };
