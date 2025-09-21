import { prisma } from "@/shared/lib/database";
import { User, UserRole } from "./model";

export const userService = {
  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? { ...user, role: user.role as UserRole } : null;
  },

  async verifyUser(username: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      return null;
    }

    return { ...user, role: user.role as UserRole };
  },

  async createUser(
    username: string,
    password: string,
    role?: UserRole,
  ): Promise<User> {
    let userRole: UserRole = "SURVIVOR";

    if (role) {
      userRole = role;
    } else {
      if (username.toLowerCase() === "admin") {
        userRole = "ADMIN";
      } else if (username.toLowerCase() === "nikita") {
        userRole = "NIKITA";
      }
    }

    const user = await prisma.user.create({
      data: {
        username,
        password,
        role: userRole,
      },
    });
    return { ...user, role: user.role as UserRole };
  },

  async createAdminUser(username: string, password: string): Promise<User> {
    return this.createUser(username, password, "ADMIN");
  },
};
