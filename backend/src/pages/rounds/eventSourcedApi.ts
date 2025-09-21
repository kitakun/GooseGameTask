import { eventStoreService } from "@/entities/events/eventStore";
import { snapshotService } from "@/entities/events/snapshotService";
import { roundRepository, userTapRepository } from "@/shared/lib/repositories";
import { RoundAggregate } from "@/entities/round/roundAggregate";
import { Round, RoundWithStats } from "@/entities/round/model";
import {
  calculateRoundDates,
  isRoundActive,
  getRoundDuration,
} from "@/shared/lib/roundUtils";

class EventSourcedRoundService {
  async getRounds(): Promise<Round[]> {
    const roundIds = await eventStoreService.getAggregateIds("Round");

    const roundPromises = roundIds.map(async (roundId) => {
      const roundAggregate = await roundRepository.getById(roundId);
      if (roundAggregate) {
        const state = roundAggregate.getState();

        if (state.isActive && state.startDate && state.endDate) {
          const now = new Date();
          if (now > state.endDate) {
            roundAggregate.endRound();
            await roundRepository.save(roundAggregate);
            await roundRepository.createSnapshot(roundAggregate);

            const updatedState = roundAggregate.getState();
            Object.assign(state, updatedState);
          }
        }

        return {
          id: roundId,
          startDate: state.startDate!,
          endDate: state.endDate!,
          isActive: state.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    });

    const rounds = (await Promise.all(roundPromises)).filter(
      (round) => round !== null,
    ) as Round[];
    return rounds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRoundWithStats(
    id: string,
    userId?: string,
  ): Promise<RoundWithStats | null> {
    const roundAggregate = await roundRepository.getById(id);
    if (!roundAggregate) {
      return null;
    }

    const state = roundAggregate.getState();

    if (state.isActive && state.startDate && state.endDate) {
      const now = new Date();
      if (now > state.endDate) {
        roundAggregate.endRound();
        await roundRepository.save(roundAggregate);
        await roundRepository.createSnapshot(roundAggregate);

        const updatedState = roundAggregate.getState();
        Object.assign(state, updatedState);
      }
    }

    const userTaps = userId ? roundAggregate.getUserTapCount(userId) : 0;
    const userPoints = userId ? roundAggregate.getUserPoints(userId) : 0;

    let winner;
    if (Object.keys(state.userTaps).length > 0) {
      const winnerUserId = Object.keys(state.userTaps).reduce(
        (prev, current) =>
          roundAggregate.getUserPoints(prev) >
          roundAggregate.getUserPoints(current)
            ? prev
            : current,
      );
      const winnerPoints = roundAggregate.getUserPoints(winnerUserId);

      const userTapId = `${winnerUserId}-${id}`;
      const userTapAggregate = await userTapRepository.getById(userTapId);
      const realUsername =
        userTapAggregate?.getState().username || `user-${winnerUserId}`;

      winner = {
        username: realUsername,
        points: winnerPoints,
      };
    }

    return {
      id,
      startDate: state.startDate!,
      endDate: state.endDate!,
      isActive: state.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalTaps: roundAggregate.getTotalTaps(),
      totalPoints: roundAggregate.getTotalPoints(),
      userTaps,
      userPoints,
      winner,
    };
  }

  async createRound(startDate?: Date): Promise<Round> {
    const { startDate: calculatedStartDate, endDate: calculatedEndDate } =
      calculateRoundDates();
    const actualStartDate = startDate || calculatedStartDate;

    const roundDuration = getRoundDuration();
    const actualEndDate = new Date(actualStartDate.getTime() + roundDuration);

    const roundId = `round-${Date.now()}`;
    const roundAggregate = new RoundAggregate(roundId);

    roundAggregate.createRound(actualStartDate, actualEndDate);

    if (isRoundActive({ startDate: actualStartDate, endDate: actualEndDate })) {
      roundAggregate.startRound();
    }

    await roundRepository.save(roundAggregate);

    const state = roundAggregate.getState();
    return {
      id: roundId,
      startDate: state.startDate!,
      endDate: state.endDate!,
      isActive: state.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async endRound(roundId: string): Promise<void> {
    const roundAggregate = await roundRepository.getById(roundId);
    if (!roundAggregate) {
      throw new Error("Round not found");
    }

    roundAggregate.endRound();
    await roundRepository.save(roundAggregate);

    await roundRepository.createSnapshot(roundAggregate);
  }

  async createSnapshotForRound(roundId: string): Promise<void> {
    const roundAggregate = await roundRepository.getById(roundId);
    if (!roundAggregate) {
      throw new Error("Round not found");
    }

    await roundRepository.createSnapshot(roundAggregate);
  }
}

export const roundService = new EventSourcedRoundService();
