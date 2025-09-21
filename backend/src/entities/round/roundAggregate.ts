import {
  DomainEvent,
  RoundCreatedEvent,
  RoundStartedEvent,
  RoundEndedEvent,
  TapPerformedEvent,
  RoundSnapshot,
} from "../events/types";
import { EventTypes, AggregateTypes } from "../events/constants";
import { calculatePoints } from "@/shared/lib/roundUtils";

export class RoundAggregate {
  private events: DomainEvent[] = [];
  private version: number = 0;

  constructor(
    public readonly id: string,
    private state: {
      startDate?: Date;
      endDate?: Date;
      isActive: boolean;
      participantCount: number;
      totalTaps: number;
      userTaps: Record<
        string,
        {
          username: string;
          userRole: string;
          tapCount: number;
        }
      >;
    } = {
      isActive: false,
      participantCount: 0,
      totalTaps: 0,
      userTaps: {},
    },
  ) {}

  static fromSnapshot(snapshot: RoundSnapshot): RoundAggregate {
    const aggregate = new RoundAggregate(snapshot.id, {
      startDate: snapshot.startDate,
      endDate: snapshot.endDate,
      isActive: snapshot.isActive,
      participantCount: snapshot.participantCount,
      totalTaps: snapshot.totalTaps || 0,
      userTaps: Object.fromEntries(
        Object.entries(snapshot.userTaps).map(([userId, userTap]) => [
          userId,
          {
            username: userTap.username,
            userRole: userTap.userRole,
            tapCount: userTap.tapCount || 0,
          },
        ]),
      ),
    });
    aggregate.version = snapshot.version;
    return aggregate;
  }

  static fromEvents(id: string, events: DomainEvent[]): RoundAggregate {
    const aggregate = new RoundAggregate(id);
    events.forEach((event) => aggregate.applyEvent(event, false));
    aggregate.version =
      events.length > 0 ? events[events.length - 1]?.version || 0 : 0;
    return aggregate;
  }

  createRound(startDate: Date, endDate: Date): void {
    if (this.state.startDate) {
      throw new Error("Round already created");
    }

    this.applyEvent({
      id: `${this.id}-${this.version + 1}`,
      aggregateId: this.id,
      aggregateType: AggregateTypes.ROUND,
      eventType: EventTypes.ROUND_CREATED,
      eventData: {
        startDate,
        endDate,
        isActive: this.isRoundActive(startDate, endDate),
      },
      version: this.version + 1,
      timestamp: new Date(),
    });
  }

  startRound(): void {
    if (!this.state.startDate) {
      throw new Error("Round not created yet");
    }
    if (this.state.isActive) {
      throw new Error("Round already started");
    }

    this.applyEvent({
      id: `${this.id}-${this.version + 1}`,
      aggregateId: this.id,
      aggregateType: AggregateTypes.ROUND,
      eventType: EventTypes.ROUND_STARTED,
      eventData: {
        startDate: this.state.startDate,
      },
      version: this.version + 1,
      timestamp: new Date(),
    });
  }

  endRound(): void {
    if (!this.state.startDate || !this.state.endDate) {
      throw new Error("Round not created");
    }

    const now = new Date();
    if (now < this.state.startDate) {
      throw new Error("Round has not started yet");
    }

    if (!this.state.isActive) {
      return;
    }

    this.applyEvent({
      id: `${this.id}-${this.version + 1}`,
      aggregateId: this.id,
      aggregateType: AggregateTypes.ROUND,
      eventType: EventTypes.ROUND_ENDED,
      eventData: {
        roundId: this.id,
        timestamp: new Date(),
      },
      version: this.version + 1,
      timestamp: new Date(),
    });
  }

  recordTap(userId: string, username?: string, userRole?: string): void {
    if (!this.state.startDate || !this.state.endDate) {
      throw new Error("Round not created");
    }

    if (!this.isRoundActive(this.state.startDate, this.state.endDate)) {
      throw new Error("Round not active");
    }

    if (username && userRole) {
      if (!this.state.userTaps[userId]) {
        this.state.userTaps[userId] = {
          username,
          userRole,
          tapCount: 0,
        };
      } else {
        this.state.userTaps[userId].username = username;
        this.state.userTaps[userId].userRole = userRole;
      }
    }

    this.applyEvent({
      id: `${this.id}-${this.version + 1}`,
      aggregateId: this.id,
      aggregateType: AggregateTypes.ROUND,
      eventType: EventTypes.TAP_PERFORMED,
      eventData: {
        userId,
        roundId: this.id,
      },
      version: this.version + 1,
      timestamp: new Date(),
    });
  }

  applyEvent(event: DomainEvent, isReplay: boolean = true): void {
    switch (event.eventType) {
      case EventTypes.ROUND_CREATED:
        this.state.startDate = event.eventData.startDate;
        this.state.endDate = event.eventData.endDate;
        this.state.isActive = event.eventData.isActive;
        break;

      case EventTypes.ROUND_STARTED:
        this.state.isActive = true;
        break;

      case EventTypes.ROUND_ENDED:
        this.state.isActive = false;
        break;

      case EventTypes.TAP_PERFORMED:
        const userId = event.eventData.userId;
        if (!this.state.userTaps[userId]) {
          this.state.userTaps[userId] = {
            username: `user-${userId}`,
            userRole: "SURVIVOR",
            tapCount: 0,
          };
        }
        this.state.totalTaps++;
        this.state.userTaps[userId].tapCount++;
        break;
    }

    if (isReplay) {
      this.events.push(event);
    }
  }

  getState() {
    return { ...this.state };
  }

  getTotalTaps(): number {
    return this.state.totalTaps;
  }

  private isTapPerformedEvent(event: DomainEvent): event is TapPerformedEvent {
    return event.eventType === EventTypes.TAP_PERFORMED;
  }

  getTotalPoints(): number {
    let totalPoints = 0;

    for (const [userId, userInfo] of Object.entries(this.state.userTaps)) {
      if (userInfo && userInfo.userRole !== "NIKITA") {
        const userPoints = calculatePoints(userInfo.tapCount);
        console.log(
          `User ${userId}: ${userInfo.tapCount} taps = ${userPoints} points`,
        );
        totalPoints += userPoints;
      }
    }
    console.log(`Total points: ${totalPoints}`);

    return totalPoints;
  }

  getUserPoints(userId: string): number {
    const userInfo = this.state.userTaps[userId];
    if (!userInfo || userInfo.userRole === "NIKITA") {
      return 0;
    }

    return calculatePoints(userInfo.tapCount);
  }

  getUserTapCount(userId: string): number {
    const userInfo = this.state.userTaps[userId];
    return userInfo ? userInfo.tapCount : 0;
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

  toSnapshot(): RoundSnapshot {
    const userTapsWithStats: Record<
      string,
      { tapCount: number; points: number; username: string; userRole: string }
    > = {};

    for (const [userId, userTap] of Object.entries(this.state.userTaps)) {
      const userTapCount = this.getUserTapCount(userId);
      const userPoints = this.getUserPoints(userId);

      userTapsWithStats[userId] = {
        tapCount: userTapCount,
        points: userPoints,
        username: userTap.username,
        userRole: userTap.userRole,
      };
    }

    return {
      id: this.id,
      startDate: this.state.startDate!,
      endDate: this.state.endDate!,
      isActive: this.state.isActive,
      totalPoints: this.getTotalPoints(),
      totalTaps: this.getTotalTaps(),
      participantCount: this.state.participantCount,
      userTaps: userTapsWithStats,
      version: this.version,
      createdAt: new Date(),
    };
  }

  private isRoundActive(startDate: Date, endDate: Date): boolean {
    const now = new Date();
    console.log("now", now);
    console.log("startDate", startDate);
    console.log("endDate", endDate);
    return now >= startDate && now <= endDate;
  }
}
