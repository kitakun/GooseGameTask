declare module "eventstore" {
  export interface EventStoreOptions {
    type:
      | "inmemory"
      | "mongodb"
      | "redis"
      | "tingodb"
      | "elasticsearch"
      | "azuretable"
      | "dynamodb";
    host?: string;
    port?: number;
    dbName?: string;
    username?: string;
    password?: string;
    eventsCollectionName?: string;
    snapshotsCollectionName?: string;
    transactionsCollectionName?: string;
    timeout?: number;
    maxSnapshotsCount?: number;
    authSource?: string;
    url?: string;
    positionsCollectionName?: string;
    db?: number;
    prefix?: string;
    dbPath?: string;
    indexName?: string;
    eventsTypeName?: string;
    snapshotsTypeName?: string;
    log?: string;
    maxSearchResults?: number;
    client?: any;
    storageAccount?: string;
    storageAccessKey?: string;
    storageTableHost?: string;
    eventsTableName?: string;
    snapshotsTableName?: string;
    undispatchedEventsTableName?: string;
    EventsReadCapacityUnits?: number;
    EventsWriteCapacityUnits?: number;
    SnapshotReadCapacityUnits?: number;
    SnapshotWriteCapacityUnits?: number;
    UndispatchedEventsReadCapacityUnits?: number;
    useUndispatchedEventsTable?: boolean;
    eventsTableStreamEnabled?: boolean;
    eventsTableStreamViewType?: string;
  }

  export interface EventStoreEvent {
    eventType: string;
    data: any;
    metadata?: any;
    id?: string;
    streamId?: string;
    version?: number;
    createdAt?: Date;
    commitId?: string;
    commitStamp?: Date;
    streamRevision?: number;
    commitSequence?: number;
    commitPosition?: number;
    preparePosition?: number;
    aggregateId?: string;
    aggregate?: string;
    context?: string;
  }

  export interface EventStream {
    events?: EventStoreEvent[];
    next(): void;
    addEvent(event: EventStoreEvent): void;
    forEach(callback: (event: EventStoreEvent, index: number) => void): void;
    map<T>(callback: (event: EventStoreEvent, index: number) => T): T[];
    filter(callback: (event: EventStoreEvent) => boolean): EventStoreEvent[];
    length: number;
  }

  export interface EventStore {
    init(callback: (err?: Error) => void): void;
    getEvents(
      skip?: number,
      limit?: number,
      callback: (err: Error | null, events: EventStream) => void,
    ): void;
    getEvents(
      streamId: string,
      skip?: number,
      limit?: number,
      callback: (err: Error | null, events: EventStream) => void,
    ): void;
    getEvents(
      query: { context?: string; aggregate?: string; aggregateId?: string },
      skip?: number,
      limit?: number,
      callback: (err: Error | null, events: EventStream) => void,
    ): void;
    getEventsByRevision(
      streamId: string,
      revMin?: number,
      revMax?: number,
      callback: (err: Error | null, events: EventStoreEvent[]) => void,
    ): void;
    getEventsByRevision(
      query: { aggregateId: string; aggregate?: string; context?: string },
      revMin?: number,
      revMax?: number,
      callback: (err: Error | null, events: EventStoreEvent[]) => void,
    ): void;
    getEventsSince(
      date: Date,
      skip?: number,
      limit?: number,
      callback: (err: Error | null, events: EventStream) => void,
    ): void;
    getEventsSince(
      date: Date,
      limit?: number,
      callback: (err: Error | null, events: EventStream) => void,
    ): void;
    getEventsSince(
      date: Date,
      callback: (err: Error | null, events: EventStream) => void,
    ): void;
    streamEvents(skip?: number, limit?: number): NodeJS.ReadableStream;
    streamEvents(
      streamId: string,
      skip?: number,
      limit?: number,
    ): NodeJS.ReadableStream;
    streamEventsSince(
      date: Date,
      skip?: number,
      limit?: number,
    ): NodeJS.ReadableStream;
    streamEventsByRevision(query: {
      aggregateId: string;
      aggregate?: string;
      context?: string;
    }): NodeJS.ReadableStream;
    getLastEvent(
      streamId: string,
      callback: (err: Error | null, event: EventStoreEvent | null) => void,
    ): void;
    getLastEvent(
      query: { context?: string; aggregate?: string; aggregateId?: string },
      callback: (err: Error | null, event: EventStoreEvent | null) => void,
    ): void;
    getNewId(callback: (err: Error | null, newId: string) => void): void;
    getEventStream(
      streamId: string,
      callback: (err: Error | null, stream: EventStream) => void,
    ): void;
    getFromSnapshot(
      streamId: string,
      callback: (err: Error | null, snapshot: any) => void,
    ): void;
    createSnapshot(
      streamId: string,
      snapshot: any,
      callback: (err: Error | null) => void,
    ): void;
    commit(stream: EventStream, callback: (err: Error | null) => void): void;
    getUndispatchedEvents(
      callback: (err: Error | null, events: EventStoreEvent[]) => void,
    ): void;
    setEventToDispatched(
      eventId: string,
      callback: (err: Error | null) => void,
    ): void;
    useEventPublisher(publisher: (event: EventStoreEvent) => void): void;
    useSnapshot(snapshot: (streamId: string, snapshot: any) => void): void;
    defineEventMappings(mappings: any): void;
    store: {
      getPendingTransactions(
        callback: (err: Error | null, transactions: any[]) => void,
      ): void;
      getLastEvent(
        query: { aggregateId: string; aggregate?: string; context?: string },
        callback: (err: Error | null, event: EventStoreEvent | null) => void,
      ): void;
      repairFailedTransaction(
        lastEvent: EventStoreEvent,
        callback: (err: Error | null) => void,
      ): void;
    };
  }

  function createEventStore(options?: EventStoreOptions): EventStore;
  export = createEventStore;
}
