export type Tap = {
  id: string;
  userId: string;
  roundId: string;
  tapCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TapResponse = {
  points: number;
  totalPoints: number;
  taps: number;
  roundActive: boolean;
};
