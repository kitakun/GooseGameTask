export const EventTypes = {
  LOCK_ACQUIRED: "LockAcquired",
  LOCK_RELEASED: "LockReleased",
  SNAPSHOT_CREATED: "SnapshotCreated",
  SNAPSHOT_DELETED: "SnapshotDeleted",
  ROUND_CREATED: "RoundCreated",
  ROUND_STARTED: "RoundStarted",
  ROUND_ENDED: "RoundEnded",
  TAP_PERFORMED: "TapPerformed",
  USER_JOINED: "UserJoined",
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

export const AggregateTypes = {
  LOCK: "Lock",
  SNAPSHOT: "Snapshot",
  ROUND: "Round",
  USER_TAP: "UserTap",
} as const;

export type AggregateType =
  (typeof AggregateTypes)[keyof typeof AggregateTypes];

export const LOCK_TIMEOUT_MS = 30000;

export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_BASE_DELAY_MS = 100;
export const DEFAULT_MAX_DELAY_MS = 1000;
export const DEFAULT_BACKOFF_MULTIPLIER = 2;
