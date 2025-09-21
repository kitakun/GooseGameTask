import { eventStoreService } from "@/entities/events/eventStore";
import { snapshotService } from "@/entities/events/snapshotService";
import { retryHelper } from "../utils/retryHelper";
import { RoundAggregate } from "@/entities/round/roundAggregate";
import { RoundSnapshot } from "@/entities/events/types";
import { AggregateTypes } from "@/entities/events/constants";

class RoundRepository {
  async getById(id: string): Promise<RoundAggregate | null> {
    const snapshot = await snapshotService.getSnapshot<RoundSnapshot>(
      id,
      AggregateTypes.ROUND,
    );

    if (snapshot) {
      const aggregate = RoundAggregate.fromSnapshot(snapshot.data);
      const events = await eventStoreService.getEvents(
        id,
        AggregateTypes.ROUND,
        snapshot.version + 1,
      );
      events.forEach((event) => {
        aggregate.applyEvent(event, true);
      });
      return aggregate;
    }

    const events = await eventStoreService.getEvents(id, AggregateTypes.ROUND, 0);
    if (events.length === 0) {
      return null;
    }

    return RoundAggregate.fromEvents(id, events);
  }

  async save(aggregate: RoundAggregate): Promise<void> {
    const uncommittedEvents = aggregate.getUncommittedEvents();
    if (uncommittedEvents.length === 0) {
      return;
    }

    await retryHelper.withRetryAndLock(`round-${aggregate.id}`, async () => {
      const currentVersion = await eventStoreService.getLatestVersion(
        aggregate.id,
        AggregateTypes.ROUND,
      );

      await eventStoreService.appendEvents(
        aggregate.id,
        AggregateTypes.ROUND,
        uncommittedEvents,
        currentVersion,
      );

      aggregate.markEventsAsCommitted();
    });
  }

  async createSnapshot(aggregate: RoundAggregate): Promise<void> {
    const snapshot = aggregate.toSnapshot();

    const userStats: Record<
      string,
      {
        tapCount: number;
        points: number;
        username: string;
        userRole: string;
      }
    > = {};

    for (const [userId, userTap] of Object.entries(snapshot.userTaps)) {
      const userTapCount = aggregate.getUserTapCount(userId);
      const userPoints = aggregate.getUserPoints(userId);

      userStats[userId] = {
        tapCount: userTapCount,
        points: userPoints,
        username: userTap.username,
        userRole: userTap.userRole,
      };
    }

    await snapshotService.createSnapshot(
      aggregate.id,
      AggregateTypes.ROUND,
      aggregate.getVersion(),
      snapshot,
      userStats,
      aggregate.getTotalTaps(),
      aggregate.getTotalPoints(),
      Object.keys(snapshot.userTaps).length,
    );
  }
}

const roundRepository = new RoundRepository();
export { roundRepository };
