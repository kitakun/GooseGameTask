import { eventStoreService } from "@/entities/events/eventStore";
import { snapshotService } from "@/entities/events/snapshotService";

export type CleanupOptions = {
  keepEventsAfterSnapshot?: number;
  maxEventAge?: number;
};

export type CleanupResult = {
  deletedCount: number;
  keptCount: number;
};

class EventCleanupJob {
  async cleanupRoundEvents(
    tenantId: string,
    roundId: string,
    options: CleanupOptions = {},
  ): Promise<CleanupResult> {
    const { keepEventsAfterSnapshot = 10, maxEventAge = 7 * 24 * 60 * 60 * 1000 } = options;
    
    try {
      const snapshot = await snapshotService.getSnapshot(roundId, "Round");
      if (!snapshot) {
        return { deletedCount: 0, keptCount: 0 };
      }

      const events = await eventStoreService.getEvents(roundId, "Round", 0);
      const now = new Date();
      
      let deletedCount = 0;
      let keptCount = 0;

      for (const event of events) {
        const eventAge = now.getTime() - event.timestamp.getTime();
        const isAfterSnapshot = event.version > snapshot.version;
        const isOldEnough = eventAge > maxEventAge;
        
        if (isAfterSnapshot && isOldEnough) {
          deletedCount++;
        } else {
          keptCount++;
        }
      }

      return { deletedCount, keptCount };
    } catch (error) {
      console.error(`Error cleaning up round events for ${roundId}:`, error);
      return { deletedCount: 0, keptCount: 0 };
    }
  }

  async cleanupUserTapEvents(
    tenantId: string,
    userId: string,
    roundId: string,
    options: CleanupOptions = {},
  ): Promise<CleanupResult> {
    const { maxEventAge = 7 * 24 * 60 * 60 * 1000 } = options;
    
    try {
      const events = await eventStoreService.getEvents(`${userId}-${roundId}`, "UserTap", 0);
      const now = new Date();
      
      let deletedCount = 0;
      let keptCount = 0;

      for (const event of events) {
        const eventAge = now.getTime() - event.timestamp.getTime();
        
        if (eventAge > maxEventAge) {
          deletedCount++;
        } else {
          keptCount++;
        }
      }

      return { deletedCount, keptCount };
    } catch (error) {
      console.error(`Error cleaning up user tap events for ${userId}-${roundId}:`, error);
      return { deletedCount: 0, keptCount: 0 };
    }
  }
}

export const eventCleanupJob = new EventCleanupJob();