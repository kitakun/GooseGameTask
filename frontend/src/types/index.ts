export interface User {
  id: string;
  username: string;
  role: 'SURVIVOR' | 'NIKITA' | 'ADMIN';
}

export interface Round {
  id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoundWithStats extends Round {
  totalTaps: number;
  totalPoints: number;
  userTaps: number;
  userPoints: number;
  winner?: {
    username: string;
    points: number;
  };
}

export interface RoundStatus {
  status: 'not_started' | 'active' | 'finished';
  timeLeft?: number;
  startTime?: string;
  endTime?: string;
}

export interface TapResponse {
  points: number;
  totalPoints: number;
  taps: number;
  roundActive: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
