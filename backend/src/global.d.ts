declare module "eventstore" {
  export interface EventStoreOptions {
    type: "inmemory" | "mongodb" | "postgresql";
    host?: string;
    port?: number;
    dbName?: string;
    username?: string;
    password?: string;
  }

  export interface EventStoreEvent {
    eventType: string;
    data: any;
    metadata?: any;
    id?: string;
    streamId?: string;
    version?: number;
    createdAt?: Date;
  }

  export class Store {
    constructor(options: EventStoreOptions);

    addEvents(
      streamId: string,
      events: EventStoreEvent[],
      expectedVersion?: number,
    ): Promise<void>;
    getEvents(
      streamId: string,
      fromVersion?: number,
    ): Promise<EventStoreEvent[]>;
    getEventsByType(eventType: string): Promise<EventStoreEvent[]>;
    getStreams(): Promise<string[]>;
  }
}
