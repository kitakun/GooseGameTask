import { prisma } from "@/shared/lib/database";
import { Round, RoundWithStats } from "@/domain/round/model";
import {
  calculateRoundDates,
  isRoundActive,
  calculatePoints,
} from "@/features/rounds/lib/utils";

export const roundService = {
  async getRounds(): Promise<Round[]> {
    const rounds = await prisma.round.findMany({
      orderBy: { createdAt: "desc" },
    });

    return rounds;
  },

  async getRoundWithStats(
    id: string,
    userId?: string
  ): Promise<RoundWithStats | null> {
    const round = await prisma.round.findUnique({
      where: { id },
    });

    if (!round) {
      return null;
    }

    const taps = await prisma.tap.findMany({
      where: { roundId: id },
      include: { user: true },
    });

    // calculate total taps and points
    const totalTaps = taps.reduce((sum, tap) => sum + tap.tapCount, 0);
    const totalPoints = taps.reduce(
      (sum, tap) => sum + calculatePoints(tap.tapCount),
      0
    );

    // get users tap stats
    const userTap = userId ? taps.find((tap) => tap.userId === userId) : null;
    const userTaps = userTap?.tapCount || 0;
    const userPoints = userTap ? calculatePoints(userTap.tapCount) : 0;

    // get winner
    let winner;
    if (taps.length > 0) {
      const winnerTap = taps.reduce((prev, current) =>
        calculatePoints(prev.tapCount) > calculatePoints(current.tapCount)
          ? prev
          : current
      );
      winner = {
        username: winnerTap.user.username,
        points: calculatePoints(winnerTap.tapCount),
      };
    }

    return {
      ...round,
      totalTaps,
      totalPoints,
      userTaps,
      userPoints,
      winner,
    };
  },

  async createRound(startDate?: Date): Promise<Round> {
    const { startDate: calculatedStartDate, endDate } = calculateRoundDates();
    const actualStartDate = startDate || calculatedStartDate;

    const round = await prisma.round.create({
      data: {
        startDate: actualStartDate,
        endDate,
        isActive: isRoundActive({ startDate: actualStartDate, endDate }),
      },
    });

    return round;
  },
};
