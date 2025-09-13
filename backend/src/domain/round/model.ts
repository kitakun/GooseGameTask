export type Round = {
  id: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RoundWithStats = Round & {
  totalTaps: number;
  totalPoints: number;
  userTaps: number;
  userPoints: number;
  winner?: {
    username: string;
    points: number;
  } | undefined;
};

export type RoundStatus = {
  status: 'not_started' | 'active' | 'finished';
  timeLeft?: number;
  startTime?: Date;
  endTime?: Date;
};
