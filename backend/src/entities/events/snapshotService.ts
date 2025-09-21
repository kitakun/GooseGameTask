import { eventStoreService } from "./eventStore";
import { lockService } from "@/shared/lib/locks/lockService";
import { retryHelper } from "@/shared/lib/utils/retryHelper";
import { RoundSnapshot, UserTapSnapshot, SnapshotCreatedEvent } from "./types";
import { EventTypes, AggregateTypes } from "./constants";

class SnapshotService {
  async createSnapshot(
    aggregateId: string,
    aggregateType: string,
    version: number,
    data: RoundSnapshot | UserTapSnapshot,
    userStats?: Record<
      string,
      {
        tapCount: number;
        points: number;
        username: string;
        userRole: string;
      }
    >,
    totalTaps?: number,
    totalPoints?: number,
    participantCount?: number,
  ): Promise<void> {
    const snapshotId = `${aggregateType}-${aggregateId}`;

    await retryHelper.withRetryAndLock(`snapshot-${snapshotId}`, async () => {
      const snapshotEvent = {
        eventType: EventTypes.SNAPSHOT_CREATED as "SnapshotCreated",
        eventData: {
          aggregateId,
          aggregateType,
          version,
          data,
          timestamp: new Date(),
          userStats,
          totalTaps,
          totalPoints,
          participantCount,
        },
        version: 1,
      };

      const currentVersion = await eventStoreService.getLatestVersion(
        snapshotId,
        AggregateTypes.SNAPSHOT,
      );

      await eventStoreService.appendEvents(
        snapshotId,
        AggregateTypes.SNAPSHOT,
        [snapshotEvent],
        currentVersion,
      );
    });
  }

  async getSnapshot<T extends RoundSnapshot | UserTapSnapshot>(
    aggregateId: string,
    aggregateType: string,
  ): Promise<{ data: T; version: number } | null> {
    const snapshotId = `${aggregateType}-${aggregateId}`;

    const events = await eventStoreService.getEvents(
      snapshotId,
      AggregateTypes.SNAPSHOT,
    );

    if (events.length === 0) {
      return null;
    }

    const latestSnapshotEvent = events[events.length - 1];
    if (
      !latestSnapshotEvent ||
      latestSnapshotEvent.eventType !== EventTypes.SNAPSHOT_CREATED
    ) {
      return null;
    }

    const snapshotEvent = latestSnapshotEvent as SnapshotCreatedEvent;
    return {
      data: snapshotEvent.eventData.data as T,
      version: snapshotEvent.eventData.version,
    };
  }

  async deleteSnapshot(
    aggregateId: string,
    aggregateType: string,
  ): Promise<void> {
    const snapshotId = `${aggregateType}-${aggregateId}`;

    await retryHelper.withRetry(async () => {
      const deleteEvent = {
        eventType: EventTypes.SNAPSHOT_DELETED as "SnapshotDeleted",
        eventData: {
          aggregateId,
          aggregateType,
          timestamp: new Date(),
        },
        version: 1,
      };

      const currentVersion = await eventStoreService.getLatestVersion(
        snapshotId,
        AggregateTypes.SNAPSHOT,
      );

      await eventStoreService.appendEvents(
        snapshotId,
        AggregateTypes.SNAPSHOT,
        [deleteEvent],
        currentVersion,
      );
    });
  }

  async getSnapshotsByType(aggregateType: string): Promise<
    Array<{
      aggregateId: string;
      data: RoundSnapshot | UserTapSnapshot;
      version: number;
    }>
  > {
    const snapshotIds = await eventStoreService.getAggregateIds(
      AggregateTypes.SNAPSHOT,
    );
    const results = [];

    for (const snapshotId of snapshotIds) {
      if (snapshotId.startsWith(`${aggregateType}-`)) {
        const aggregateId = snapshotId.split("-")[1];
        if (aggregateId) {
          const snapshot = await this.getSnapshot(aggregateId, aggregateType);
          if (snapshot) {
            results.push({
              aggregateId,
              data: snapshot.data,
              version: snapshot.version,
            });
          }
        }
      }
    }

    return results;
  }
}

const snapshotService = new SnapshotService();
export { snapshotService };
