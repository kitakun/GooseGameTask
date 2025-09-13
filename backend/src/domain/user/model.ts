export type User = {
  id: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRole = 'SURVIVOR' | 'NIKITA' | 'ADMIN';
