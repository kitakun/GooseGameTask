import { prisma } from "@/shared/lib/database";
import { User } from "@/domain/user/model";
import { hashPassword, getUserRole } from "@/features/auth/lib/utils";

export const userService = {
  async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = hashPassword(password);
    const role = getUserRole(username);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    return user;
  },

  async verifyUser(username: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const { verifyPassword } = await import("@/features/auth/lib/utils");
    const isValid = verifyPassword(password, user.password);

    if (!isValid) {
      return null;
    }

    return user;
  },

  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user;
  },
};
