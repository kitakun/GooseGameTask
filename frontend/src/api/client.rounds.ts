import { Round, RoundWithStats } from '../types';
import { api } from './client';

export const roundsApi = {
  getRounds: async (): Promise<{ rounds: Round[] }> => {
    return api.get<{ rounds: Round[] }>('/rounds');
  },
  
  getRound: async (id: string): Promise<{ round: RoundWithStats }> => {
    return api.get<{ round: RoundWithStats }>(`/rounds/${id}`);
  },
  
  createRound: async (startDate?: string): Promise<{ round: Round }> => {
    return api.post<{ round: Round }>('/rounds', { startDate });
  },
};
