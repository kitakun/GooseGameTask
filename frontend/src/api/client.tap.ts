import { api } from './client';
import { TapStatsResponse } from '../types';

export const tapApi = {
  tap: async (roundId: string): Promise<void> => {
    // Atomic operation - just send roundId, no response data needed
    await api.post('/tap', { roundId });
  },
  
  getStats: async (roundId: string): Promise<TapStatsResponse> => {
    return api.get<TapStatsResponse>(`/tap/stats/${roundId}`);
  },
};
