import { Round } from '../types';

export type RoundStatus = {
  status: 'not_started' | 'active' | 'finished';
  timeLeft?: number;
  startTime?: Date;
  endTime?: Date;
};

export const getRoundStatus = (round: Round): RoundStatus => {
  const now = new Date();
  const startDate = new Date(round.startDate);
  const endDate = new Date(round.endDate);
  
  if (now < startDate) {
    return {
      status: 'not_started',
      timeLeft: startDate.getTime() - now.getTime(),
      startTime: startDate,
      endTime: endDate
    };
  }
  
  if (now > endDate) {
    return {
      status: 'finished',
      endTime: endDate
    };
  }
  
  return {
    status: 'active',
    timeLeft: endDate.getTime() - now.getTime(),
    startTime: startDate,
    endTime: endDate
  };
};

export const formatTimeLeft = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatDate = (date: Date | string): string => {
  const wrappedDate = typeof date === 'string' ? new Date(date) : date;
  return wrappedDate.toLocaleString('ru-RU');
};

export const isRoundActive = (round: Round): boolean => {
  const status = getRoundStatus(round);
  return status.status === 'active';
};

export const canTap = (round: Round): boolean => {
  const status = getRoundStatus(round);
  return status.status === 'active';
};
