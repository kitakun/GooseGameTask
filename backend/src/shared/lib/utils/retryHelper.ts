import {
  DEFAULT_MAX_RETRIES,
  DEFAULT_BASE_DELAY_MS,
  DEFAULT_MAX_DELAY_MS,
  DEFAULT_BACKOFF_MULTIPLIER,
} from "@/entities/events/constants";

type RetryOptions = {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
};

class RetryHelper {
  async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const {
      maxRetries = DEFAULT_MAX_RETRIES,
      baseDelayMs = DEFAULT_BASE_DELAY_MS,
      maxDelayMs = DEFAULT_MAX_DELAY_MS,
      backoffMultiplier = DEFAULT_BACKOFF_MULTIPLIER,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries - 1) {
          throw lastError;
        }

        const delay = Math.min(
          baseDelayMs * Math.pow(backoffMultiplier, attempt),
          maxDelayMs,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  async withRetryAndLock<T>(
    lockId: string,
    operation: () => Promise<T>,
    retryOptions: RetryOptions = {},
  ): Promise<T> {
    const { lockService } = await import("../locks/lockService");

    return await lockService.withLock(lockId, async () => {
      return this.withRetry(operation, retryOptions);
    });
  }
}

const retryHelper = new RetryHelper();
export { retryHelper };
