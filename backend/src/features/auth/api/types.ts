import { User } from '@/domain/user/model';

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};
