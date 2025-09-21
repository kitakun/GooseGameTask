import { eventStore } from "@/app/eventStore";
import { DomainEvent } from "./types";

class EventStoreService {
  async appendEvents(
    aggregateId: string,
    aggregateType: string,
    events: Omit<
      DomainEvent,
      "id" | "aggregateId" | "aggregateType" | "timestamp"
    >[],
    expectedVersion: number,
    metadata?: any,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const streamId = `${aggregateType}:${aggregateId}`;

      eventStore.getEventStream(streamId, (err: any, stream: any) => {
        if (err) {
          reject(err);
          return;
        }

        events.forEach((event) => {
          stream.addEvent({
            eventType: event.eventType,
            data: event.eventData,
            metadata: {
              ...metadata,
              timestamp: new Date().toISOString(),
            },
            aggregate: aggregateType,
            aggregateId: aggregateId,
          });
        });

        eventStore.commit(stream, (commitErr: any) => {
          if (commitErr) {
            if (commitErr.message && commitErr.message.includes("version")) {
              reject(
                new Error(
                  `Version conflict: expected version ${expectedVersion} but stream has been modified`,
                ),
              );
            } else {
              reject(commitErr);
            }
            return;
          }
          resolve();
        });
      });
    });
  }

  async getEvents(
    aggregateId: string,
    aggregateType: string,
    fromVersion: number = 0,
  ): Promise<DomainEvent[]> {
    return new Promise((resolve, reject) => {
      const streamId = `${aggregateType}:${aggregateId}`;

      eventStore.getEvents(
        streamId,
        fromVersion,
        -1,
        (err: any, events: any) => {
          if (err) {
            reject(err);
            return;
          }

          if (!events || typeof events.map !== "function") {
            console.warn(
              "getEvents: events structure is not as expected:",
              events,
            );
            resolve([]);
            return;
          }

          const domainEvents = events.map((event: any, index: number) => ({
            id: `${aggregateId}-${fromVersion + index + 1}`,
            aggregateId,
            aggregateType,
            eventType: event.payload?.eventType || event.eventType,
            eventData: event.payload?.data || event.data,
            version: fromVersion + index + 1,
            timestamp: event.commitStamp || event.createdAt || new Date(),
            metadata: event.payload?.metadata || event.metadata,
          })) as DomainEvent[];

          resolve(domainEvents);
        },
      );
    });
  }

  async getEventsByType(
    eventType: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<DomainEvent[]> {
    return new Promise((resolve, reject) => {
      eventStore.getEvents(0, -1, (err: any, events: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!events || typeof events.filter !== "function") {
          console.warn(
            "getEventsByType: events structure is not as expected:",
            events,
          );
          resolve([]);
          return;
        }

        let filteredEvents = events.filter(
          (event: any) =>
            (event.payload?.eventType || event.eventType) === eventType,
        );

        if (fromDate || toDate) {
          filteredEvents = filteredEvents.filter((event: any) => {
            const eventDate = event.commitStamp || event.createdAt;
            if (fromDate && eventDate && eventDate < fromDate) return false;
            if (toDate && eventDate && eventDate > toDate) return false;
            return true;
          });
        }

        const domainEvents = filteredEvents.map((event: any) => ({
          id: event.id || "",
          aggregateId: event.aggregateId || "",
          aggregateType: event.aggregate || "",
          eventType: event.payload?.eventType || event.eventType,
          eventData: event.payload?.data || event.data,
          version: event.streamRevision || 0,
          timestamp: event.commitStamp || event.createdAt || new Date(),
          metadata: event.payload?.metadata || event.metadata,
        })) as DomainEvent[];

        resolve(domainEvents);
      });
    });
  }

  async getLatestVersion(
    aggregateId: string,
    aggregateType: string,
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const streamId = `${aggregateType}:${aggregateId}`;
      eventStore.getEvents(streamId, 0, -1, (err: any, events: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!events || typeof events.length !== "number") {
          console.warn(
            "getLatestVersion: events structure is not as expected:",
            events,
          );
          resolve(0);
          return;
        }

        resolve(events.length);
      });
    });
  }

  async getAggregateIds(aggregateType: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      eventStore.getEvents(0, -1, (err: any, events: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!events || typeof events.forEach !== "function") {
          console.warn(
            "getAggregateIds: events structure is not as expected:",
            events,
          );
          resolve([]);
          return;
        }

        const aggregateIds = new Set<string>();
        events.forEach((event: any) => {
          if (
            event.streamId &&
            event.streamId.startsWith(`${aggregateType}:`)
          ) {
            const aggregateId = event.streamId.substring(
              `${aggregateType}:`.length,
            );
            aggregateIds.add(aggregateId);
          }
        });

        resolve(Array.from(aggregateIds));
      });
    });
  }
}

const eventStoreService = new EventStoreService();
export { eventStoreService };
