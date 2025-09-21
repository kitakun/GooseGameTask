import { eventStoreService } from "@/entities/events/eventStore";
import { snapshotService } from "@/entities/events/snapshotService";
import { retryHelper } from "../utils/retryHelper";
import { UserTapAggregate } from "@/entities/tap/userTapAggregate";
import { UserTapSnapshot } from "@/entities/events/types";
import { AggregateTypes } from "@/entities/events/constants";

class UserTapRepository {
  async getById(id: string): Promise<UserTapAggregate | null> {
    const snapshot = await snapshotService.getSnapshot<UserTapSnapshot>(
      id,
      AggregateTypes.USER_TAP,
    );

    if (snapshot) {
      const aggregate = UserTapAggregate.fromSnapshot(snapshot.data);
      const events = await eventStoreService.getEvents(
        id,
        AggregateTypes.USER_TAP,
        snapshot.version + 1,
      );
      events.forEach((event) => {
        aggregate.applyEvent(event, true);
      });
      return aggregate;
    }

    const events = await eventStoreService.getEvents(
      id,
      AggregateTypes.USER_TAP,
    );
    if (events.length === 0) {
      return null;
    }

    return UserTapAggregate.fromEvents(id, events);
  }

  async getByUserAndRound(
    userId: string,
    roundId: string,
  ): Promise<UserTapAggregate | null> {
    const aggregateId = `${userId}-${roundId}`;
    return this.getById(aggregateId);
  }

  async save(aggregate: UserTapAggregate): Promise<void> {
    const uncommittedEvents = aggregate.getUncommittedEvents();
    if (uncommittedEvents.length === 0) {
      return;
    }

    await retryHelper.withRetryAndLock(`usertap-${aggregate.id}`, async () => {
      const currentVersion = await eventStoreService.getLatestVersion(
        aggregate.id,
        AggregateTypes.USER_TAP,
      );

      await eventStoreService.appendEvents(
        aggregate.id,
        AggregateTypes.USER_TAP,
        uncommittedEvents,
        currentVersion,
      );

      aggregate.markEventsAsCommitted();
    });
  }

  async createSnapshot(aggregate: UserTapAggregate): Promise<void> {
    const snapshot = aggregate.toSnapshot();
    await snapshotService.createSnapshot(
      aggregate.id,
      AggregateTypes.USER_TAP,
      aggregate.getVersion(),
      snapshot,
    );
  }
}

const userTapRepository = new UserTapRepository();
export { userTapRepository };
