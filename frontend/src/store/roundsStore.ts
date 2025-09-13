import { create } from "zustand";
import { Round, RoundWithStats } from "../types";
import { roundsApi } from "../api";

type RoundsState = {
  rounds: Round[];
  currentRound: RoundWithStats | null;
  isLoading: boolean;
  error: string | null;
  fetchRounds: () => Promise<void>;
  fetchRound: (id: string) => Promise<void>;
  createRound: (startDate?: string) => Promise<Round>;
  clearError: () => void;
};

export const useRoundsStore = create<RoundsState>((set, get) => ({
  rounds: [],
  currentRound: null,
  isLoading: false,
  error: null,

  fetchRounds: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await roundsApi.getRounds();
      set({ rounds: response.rounds, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Ошибка загрузки раундов",
        isLoading: false,
      });
    }
  },

  fetchRound: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await roundsApi.getRound(id);
      set({ currentRound: response.round, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Ошибка загрузки раунда",
        isLoading: false,
      });
    }
  },

  createRound: async (startDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await roundsApi.createRound(startDate);
      const newRounds = [response.round, ...get().rounds];
      set({ rounds: newRounds, isLoading: false });
      return response.round;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Ошибка создания раунда",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
