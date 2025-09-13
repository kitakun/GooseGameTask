import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, UserRole } from "@/domain/user/model";
import { JWT_SECRET } from "@/shared/config";

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

export const generateToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (
  token: string
): { id: string; username: string; role: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      role: string;
    };
  } catch {
    return null;
  }
};

export const getUserRole = (username: string): UserRole => {
  const lowerUsername = username.toLowerCase();

  if (lowerUsername === "admin") {
    return "ADMIN";
  }

  if (lowerUsername === "никита" || lowerUsername === "nikita") {
    return "NIKITA";
  }

  return "SURVIVOR";
};
