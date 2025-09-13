import { create } from "zustand";
import { User } from "../types";
import { authApi } from "../api";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ username, password });
      set({ user: response.user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Ошибка входа",
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch (error) {
      // ignore
    } finally {
      set({ user: null, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = (await authApi.getMe()) as { user: User };
      set({ user: response.user, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
