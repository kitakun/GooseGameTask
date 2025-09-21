export type BaseEvent = {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  timestamp: Date;
  metadata?: Record<string, any>;
};

export type RoundCreatedEvent = BaseEvent & {
  eventType: "RoundCreated";
  eventData: {
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
};

export type RoundStartedEvent = BaseEvent & {
  eventType: "RoundStarted";
  eventData: {
    startDate: Date;
  };
};

export type RoundEndedEvent = BaseEvent & {
  eventType: "RoundEnded";
  eventData: {
    roundId: string;
    timestamp: Date;
  };
};

export type TapPerformedEvent = BaseEvent & {
  eventType: "TapPerformed";
  eventData: {
    userId: string;
    roundId: string;
  };
};

export type UserJoinedEvent = BaseEvent & {
  eventType: "UserJoined";
  eventData: {
    userId: string;
    roundId: string;
    username: string;
    userRole: string;
  };
};

export type LockAcquiredEvent = BaseEvent & {
  eventType: "LockAcquired";
  eventData: {
    lockId: string;
    resourceId: string;
    timestamp: Date;
    expiresAt: Date;
  };
};

export type LockReleasedEvent = BaseEvent & {
  eventType: "LockReleased";
  eventData: {
    lockId: string;
    resourceId: string;
    timestamp: Date;
  };
};

export type SnapshotCreatedEvent = BaseEvent & {
  eventType: "SnapshotCreated";
  eventData: {
    aggregateId: string;
    aggregateType: string;
    version: number;
    data: any;
    timestamp: Date;
    userStats?: Record<
      string,
      {
        tapCount: number;
        points: number;
        username: string;
        userRole: string;
      }
    >;
    totalTaps?: number;
    totalPoints?: number;
    participantCount?: number;
  };
};

export type SnapshotDeletedEvent = BaseEvent & {
  eventType: "SnapshotDeleted";
  eventData: {
    aggregateId: string;
    aggregateType: string;
    timestamp: Date;
  };
};


export type DomainEvent =
  | RoundCreatedEvent
  | RoundStartedEvent
  | RoundEndedEvent
  | TapPerformedEvent
  | UserJoinedEvent
  | LockAcquiredEvent
  | LockReleasedEvent
  | SnapshotCreatedEvent
  | SnapshotDeletedEvent;

export type EventMetadata = {
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  correlationId?: string;
  causationId?: string;
};

export type RoundSnapshot = {
  id: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  totalPoints: number;
  totalTaps: number;
  participantCount: number;
  userTaps: Record<
    string,
    {
      tapCount: number;
      points: number;
      username: string;
      userRole: string;
    }
  >;
  version: number;
  createdAt: Date;
};

export type UserTapSnapshot = {
  id: string;
  userId: string;
  roundId: string;
  tapCount: number;
  points: number;
  username: string;
  userRole: string;
  version: number;
  createdAt: Date;
};
