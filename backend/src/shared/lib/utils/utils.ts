import jwt from "jsonwebtoken";
import { User, UserRole } from "@/entities/user/model";
import { JWT_SECRET } from "@/shared/config";

export const generateToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

export const verifyToken = (
  token: string,
): { id: string; username: string; role: UserRole } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      role: UserRole;
    };
  } catch {
    return null;
  }
};
