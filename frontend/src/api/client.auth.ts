import { LoginRequest, LoginResponse } from '../types';
import { api } from './client';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/login', data);
  },
  
  logout: async (): Promise<void> => {
    await api.post<void>('/logout');
  },
  
  getMe: async () => {
    return api.get('/me');
  },
};
