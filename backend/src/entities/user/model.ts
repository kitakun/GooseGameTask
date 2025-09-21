export type User = {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRole = "SURVIVOR" | "NIKITA" | "ADMIN";
