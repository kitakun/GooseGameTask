import { eventStoreService } from "@/entities/events/eventStore";
import { retryHelper } from "../utils/retryHelper";
import { LockAcquiredEvent } from "@/entities/events/types";
import {
  EventTypes,
  AggregateTypes,
  LOCK_TIMEOUT_MS,
} from "@/entities/events/constants";

class LockService {
  async acquireLock(resourceId: string, lockId: string): Promise<boolean> {
    const lockStreamId = `Lock-${resourceId}`;

    try {
      return await retryHelper.withRetry(
        async () => {
          const lockEvent = {
            eventType: EventTypes.LOCK_ACQUIRED as "LockAcquired",
            eventData: {
              lockId,
              resourceId,
              timestamp: new Date(),
              expiresAt: new Date(Date.now() + LOCK_TIMEOUT_MS),
            },
            version: 1,
          };

          const currentVersion = await eventStoreService.getLatestVersion(
            lockStreamId,
            AggregateTypes.LOCK,
          );

          const events = await eventStoreService.getEvents(
            lockStreamId,
            AggregateTypes.LOCK,
          );

          if (events.length > 0) {
            const lastEvent = events[events.length - 1];
            if (lastEvent && lastEvent.eventType === EventTypes.LOCK_ACQUIRED) {
              const lockEvent = lastEvent as LockAcquiredEvent;
              const expiresAt = new Date(lockEvent.eventData.expiresAt);

              if (expiresAt > new Date()) {
                throw new Error("Lock already acquired");
              }
            }
          }

          await eventStoreService.appendEvents(
            lockStreamId,
            AggregateTypes.LOCK,
            [lockEvent],
            currentVersion,
          );

          return true;
        },
        { maxRetries: 3, baseDelayMs: 50 },
      );
    } catch (error) {
      return false;
    }
  }

  async releaseLock(resourceId: string, lockId: string): Promise<void> {
    const lockStreamId = `Lock-${resourceId}`;

    await retryHelper.withRetry(async () => {
      const unlockEvent = {
        eventType: EventTypes.LOCK_RELEASED as "LockReleased",
        eventData: {
          lockId,
          resourceId,
          timestamp: new Date(),
        },
        version: 1,
      };

      const currentVersion = await eventStoreService.getLatestVersion(
        lockStreamId,
        AggregateTypes.LOCK,
      );

      await eventStoreService.appendEvents(
        lockStreamId,
        AggregateTypes.LOCK,
        [unlockEvent],
        currentVersion,
      );
    });
  }

  async withLock<T>(
    resourceId: string,
    operation: () => Promise<T>,
    lockId?: string,
  ): Promise<T> {
    const actualLockId = lockId || `${Date.now()}-${Math.random()}`;

    const acquired = await this.acquireLock(resourceId, actualLockId);
    if (!acquired) {
      throw new Error(`Failed to acquire lock for resource: ${resourceId}`);
    }

    try {
      return await operation();
    } finally {
      await this.releaseLock(resourceId, actualLockId);
    }
  }
}

const lockService = new LockService();
export { lockService };
