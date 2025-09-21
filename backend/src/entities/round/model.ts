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
  winner?:
    | {
        username: string;
        points: number;
      }
    | undefined;
};
