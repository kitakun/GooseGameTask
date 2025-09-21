import { eventStoreService } from "@/entities/events/eventStore";
import { EventTypes, AggregateTypes } from "@/entities/events/constants";
import { TapResponse } from "@/entities/tap/model";
import { userService } from "@/entities/user/api";
import { isRoundActive, calculatePoints } from "@/shared/lib/roundUtils";
import { roundRepository } from "@/shared/lib/repositories";

class EventSourcedTapService {
  async processTap(
    userId: string,
    roundId: string,
    userRole: string,
  ): Promise<void> {
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const roundAggregate = await roundRepository.getById(roundId);
    if (!roundAggregate) {
      throw new Error("Round not found");
    }

    const roundState = roundAggregate.getState();
    const roundActive = isRoundActive({
      startDate: roundState.startDate!,
      endDate: roundState.endDate!,
    });

    if (!roundActive) {
      throw new Error("Round not active");
    }

    await eventStoreService.appendEvents(
      `${userId}-${roundId}`,
      AggregateTypes.USER_TAP,
      [
        {
          eventType: EventTypes.TAP_PERFORMED,
          eventData: {
            userId,
            roundId,
          },
          version: 1,
        },
      ],
      0,
    );

    return;
  }

  async getUserTapStats(
    userId: string,
    roundId: string,
  ): Promise<{ taps: number; points: number }> {
    const userTapId = `${userId}-${roundId}`;

    try {
      const roundAggregate = await roundRepository.getById(roundId);
      if (!roundAggregate) {
        return { taps: 0, points: 0 };
      }

      const roundState = roundAggregate.getState();
      const roundStartDate = roundState.startDate!;
      const roundEndDate = roundState.endDate!;

      const events = await eventStoreService.getEvents(
        userTapId,
        AggregateTypes.USER_TAP,
      );
      const tapEvents = events.filter((event) => {
        if (event.eventType !== EventTypes.TAP_PERFORMED) {
          return false;
        }

        const eventTimestamp = new Date(event.timestamp);
        return (
          eventTimestamp >= roundStartDate && eventTimestamp <= roundEndDate
        );
      });

      const taps = tapEvents.length;
      const points = calculatePoints(taps);

      return { taps, points };
    } catch (error) {
      return { taps: 0, points: 0 };
    }
  }

  async getRoundStats(roundId: string): Promise<{
    totalTaps: number;
    totalPoints: number;
    participantCount: number;
    userTaps: Record<
      string,
      { tapCount: number; points: number; username: string; userRole: string }
    >;
    winner: { username: string; points: number } | null;
  }> {
    try {
      const roundAggregate = await roundRepository.getById(roundId);
      if (!roundAggregate) {
        return {
          totalTaps: 0,
          totalPoints: 0,
          participantCount: 0,
          userTaps: {},
          winner: null,
        };
      }

      const roundState = roundAggregate.getState();
      const roundStartDate = roundState.startDate!;
      const roundEndDate = roundState.endDate!;

      const events = await eventStoreService.getEventsByType(
        EventTypes.TAP_PERFORMED,
      );
      const roundEvents = events.filter((event) => {
        if (
          event.eventType !== EventTypes.TAP_PERFORMED ||
          (event.eventData as any)?.roundId !== roundId
        ) {
          return false;
        }

        const eventTimestamp = new Date(event.timestamp);
        return (
          eventTimestamp >= roundStartDate && eventTimestamp <= roundEndDate
        );
      });

      const totalTaps = roundEvents.length;
      const totalPoints = calculatePoints(totalTaps);

      const userTaps: Record<
        string,
        { tapCount: number; points: number; username: string; userRole: string }
      > = {};
      const uniqueUsers = new Set<string>();

      const userTapCounts: Record<string, number> = {};
      roundEvents.forEach((event) => {
        const userId = (event.eventData as any)?.userId;
        if (userId) {
          uniqueUsers.add(userId);
          userTapCounts[userId] = (userTapCounts[userId] || 0) + 1;
        }
      });

      for (const userId of uniqueUsers) {
        try {
          const user = await userService.getUserById(userId);
          const tapCount = userTapCounts[userId] || 0;
          userTaps[userId] = {
            tapCount: tapCount,
            points: calculatePoints(tapCount),
            username: user?.username || "Unknown",
            userRole: user?.role || "SURVIVOR",
          };
        } catch (error) {
          const tapCount = userTapCounts[userId] || 0;
          userTaps[userId] = {
            tapCount: tapCount,
            points: calculatePoints(tapCount),
            username: "Unknown",
            userRole: "SURVIVOR",
          };
        }
      }

      let winner = null;
      if (Object.keys(userTaps).length > 0) {
        const winnerUserId = Object.keys(userTaps).reduce((prev, current) =>
          (userTaps[prev]?.points || 0) > (userTaps[current]?.points || 0)
            ? prev
            : current,
        );
        const winnerData = userTaps[winnerUserId];
        if (winnerData) {
          winner = {
            username: winnerData.username,
            points: winnerData.points,
          };
        }
      }

      return {
        totalTaps,
        totalPoints,
        participantCount: uniqueUsers.size,
        userTaps,
        winner,
      };
    } catch (error) {
      return {
        totalTaps: 0,
        totalPoints: 0,
        participantCount: 0,
        userTaps: {},
        winner: null,
      };
    }
  }
}

export const tapService = new EventSourcedTapService();
