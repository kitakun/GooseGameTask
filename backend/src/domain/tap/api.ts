// Tap entity API
import { prisma } from '@/shared/lib/database';
import { Tap, TapResponse } from '@/domain/tap/model';
import { isRoundActive, calculatePoints } from '@/features/rounds/lib/utils';

export const tapService = {
  async processTap(userId: string, roundId: string, userRole: string): Promise<TapResponse> {
    return await prisma.$transaction(async (tx) => {
      const round = await tx.round.findUnique({
        where: { id: roundId }
      });
      
      if (!round) {
        throw new Error('Round not found');
      }
      
      if (!isRoundActive(round)) {
        return {
          points: 0,
          totalPoints: 0,
          taps: 0,
          roundActive: false
        };
      }
      
      let userTap = await tx.tap.findUnique({
        where: {
          userId_roundId: {
            userId,
            roundId
          }
        }
      });
      
      let newTapCount = 1;
      
      if (userTap) {
        newTapCount = userTap.tapCount + 1;
        
        await tx.tap.update({
          where: { id: userTap.id },
          data: { tapCount: newTapCount }
        });
      } else {
        await tx.tap.create({
          data: {
            userId,
            roundId,
            tapCount: 1
          }
        });
      }
      
      await tx.round.update({
        where: { id: roundId },
        data: { isActive: isRoundActive(round) }
      });
      
      let userPoints = 0;
      if (userRole !== 'NIKITA') {
        userPoints = calculatePoints(newTapCount);
      }
      
      const allTaps = await tx.tap.findMany({
        where: { roundId }
      });
      
      const totalPoints = allTaps.reduce((sum, tap) => {
        return sum + calculatePoints(tap.tapCount);
      }, 0);
      
      return {
        points: userPoints,
        totalPoints,
        taps: newTapCount,
        roundActive: true
      };
    });
  },
  
  async getUserTapStats(userId: string, roundId: string): Promise<{ taps: number; points: number }> {
    const tap = await prisma.tap.findUnique({
      where: {
        userId_roundId: {
          userId,
          roundId
        }
      }
    });
    
    if (!tap) {
      return { taps: 0, points: 0 };
    }
    
    const points = calculatePoints(tap.tapCount);
    return { taps: tap.tapCount, points };
  }
};
