import { roundService } from "@/pages/rounds/eventSourcedApi";
import { eventStoreService } from "@/entities/events/eventStore";
import { snapshotService } from "@/entities/events/snapshotService";
import { roundRepository } from "@/shared/lib/repositories";
import { RoundSnapshot } from "@/entities/events/types";
import { isRoundActive } from "../roundUtils";
import { eventCleanupJob } from "./eventCleanupJob";

class RoundSnapshotJob {
  private intervalId: NodeJS.Timeout | null = null;

  start(intervalMs: number = 60000): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      await this.checkAndCreateSnapshots();
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAndCreateSnapshots(): Promise<void> {
    try {
      const roundIds = await eventStoreService.getAggregateIds("Round");

      for (const roundId of roundIds) {
        await this.processRound(roundId);
      }

      await this.runCleanupJob();
    } catch (error) {
      console.error("Error in snapshot job:", error);
    }
  }

  private async runCleanupJob(): Promise<void> {
    try {
      const roundIds = await eventStoreService.getAggregateIds("Round");
      
      for (const roundId of roundIds) {
        const result = await eventCleanupJob.cleanupRoundEvents("default", roundId, {
          keepEventsAfterSnapshot: 10,
          maxEventAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        if (result.deletedCount > 0) {
          console.log(`Cleaned up ${result.deletedCount} events for round ${roundId}`);
        }
      }
    } catch (error) {
      console.error("Error in cleanup job:", error);
    }
  }

  private async processRound(roundId: string): Promise<void> {
    try {
      const roundAggregate = await roundRepository.getById(roundId);
      if (!roundAggregate) {
        return;
      }

      const state = roundAggregate.getState();

      if (
        state.startDate &&
        state.endDate &&
        !isRoundActive({
          startDate: state.startDate,
          endDate: state.endDate,
        })
      ) {
        const existingSnapshot =
          await snapshotService.getSnapshot<RoundSnapshot>(roundId, "Round");

        if (!existingSnapshot) {
          await roundService.createSnapshotForRound(roundId);
        }
      }
    } catch (error) {
      console.error(`Error processing round ${roundId}:`, error);
    }
  }

  async triggerSnapshot(roundId: string): Promise<void> {
    await this.processRound(roundId);
  }
}

const roundSnapshotJob = new RoundSnapshotJob();
export { roundSnapshotJob };
