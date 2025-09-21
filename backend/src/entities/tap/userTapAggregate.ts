import {
  DomainEvent,
  TapPerformedEvent,
  UserJoinedEvent,
  UserTapSnapshot,
} from "../events/types";
import { EventTypes, AggregateTypes } from "../events/constants";
import { calculatePoints } from "@/shared/lib/roundUtils";

export class UserTapAggregate {
  private events: DomainEvent[] = [];
  private version: number = 0;

  constructor(
    public readonly id: string,
    private state: {
      userId: string;
      roundId: string;
      username: string;
      userRole: string;
      tapCount: number;
    },
  ) {}

  static fromSnapshot(snapshot: UserTapSnapshot): UserTapAggregate {
    const aggregate = new UserTapAggregate(snapshot.id, {
      userId: snapshot.userId,
      roundId: snapshot.roundId,
      username: snapshot.username,
      userRole: snapshot.userRole,
      tapCount: snapshot.tapCount || 0,
    });
    aggregate.version = snapshot.version;
    return aggregate;
  }

  static fromEvents(id: string, events: DomainEvent[]): UserTapAggregate {
    const aggregate = new UserTapAggregate(id, {
      userId: "",
      roundId: "",
      username: "",
      userRole: "SURVIVOR",
      tapCount: 0,
    });
    events.forEach((event) => aggregate.applyEvent(event, false));
    aggregate.version =
      events.length > 0 ? events[events.length - 1]?.version || 0 : 0;
    return aggregate;
  }

  joinRound(
    userId: string,
    roundId: string,
    username: string,
    userRole: string,
  ): void {
    if (this.state.userId && this.state.userId !== userId) {
      throw new Error("User already joined with different ID");
    }

    this.applyEvent({
      id: `${this.id}-${this.version + 1}`,
      aggregateId: this.id,
      aggregateType: AggregateTypes.USER_TAP,
      eventType: EventTypes.USER_JOINED,
      eventData: {
        userId,
        roundId,
        username,
        userRole,
      },
      version: this.version + 1,
      timestamp: new Date(),
    });
  }

  performTap(): void {
    if (!this.state.userId) {
      throw new Error("User not joined to round");
    }

    const currentTapCount = this.getTapCount();
    const newTapCount = currentTapCount + 1;
    const points =
      this.state.userRole === "NIKITA" ? 0 : calculatePoints(newTapCount);

    console.log(
      `UserTapAggregate.performTap(): Current tap count: ${currentTapCount}, new tap count: ${newTapCount}, events before: ${this.events.length}`,
    );

    this.applyEvent({
      id: `${this.id}-${this.version + 1}`,
      aggregateId: this.id,
      aggregateType: AggregateTypes.USER_TAP,
      eventType: EventTypes.TAP_PERFORMED,
      eventData: {
        userId: this.state.userId,
        roundId: this.state.roundId,
      },
      version: this.version + 1,
      timestamp: new Date(),
    });

    console.log(
      `UserTapAggregate.performTap(): Events after: ${this.events.length}`,
    );
  }

  applyEvent(event: DomainEvent, isReplay: boolean = true): void {
    switch (event.eventType) {
      case EventTypes.USER_JOINED:
        const joinEvent = event;
        this.state.userId = joinEvent.eventData.userId;
        this.state.roundId = joinEvent.eventData.roundId;
        this.state.username = joinEvent.eventData.username;
        this.state.userRole = joinEvent.eventData.userRole;
        break;

      case EventTypes.TAP_PERFORMED:
        this.state.tapCount++;
        break;
    }

    this.events.push(event);
  }

  getState() {
    return { ...this.state };
  }

  private isTapPerformedEvent(event: DomainEvent): event is TapPerformedEvent {
    return event.eventType === EventTypes.TAP_PERFORMED;
  }

  getTapCount(): number {
    console.log(
      `UserTapAggregate.getTapCount(): ${this.state.tapCount} taps for user ${this.state.userId}`,
    );
    return this.state.tapCount;
  }

  getPoints(): number {
    const tapCount = this.state.tapCount;
    console.log(
      `UserTapAggregate.getPoints(): ${tapCount} taps for user ${this.state.userId}`,
    );

    if (this.state.userRole === "NIKITA") {
      return 0;
    }

    const points = calculatePoints(tapCount);
    console.log(
      `UserTapAggregate.getPoints(): ${points} points for user ${this.state.userId}`,
    );
    return points;
  }

  getVersion(): number {
    return this.version;
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.events];
  }

  markEventsAsCommitted(): void {
    this.events = [];
  }

  toSnapshot(): UserTapSnapshot {
    return {
      id: this.id,
      userId: this.state.userId,
      roundId: this.state.roundId,
      tapCount: this.getTapCount(),
      points: this.getPoints(),
      username: this.state.username,
      userRole: this.state.userRole,
      version: this.version,
      createdAt: new Date(),
    };
  }
}
