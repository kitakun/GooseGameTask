import { TapResponse } from '../types';
import { api } from './client';

export const tapApi = {
  tap: async (roundId: string): Promise<TapResponse> => {
    return api.post<TapResponse>('/tap', { roundId });
  },
};
