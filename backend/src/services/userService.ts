import { prisma } from "../providers/prisma";
import { User } from "@prisma/client";
import { BasicCreateDTO } from "../interfaces/user.interface";

export class UserService {
  constructor() {}

  async create(userData: BasicCreateDTO) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: userData.email,
            password_hash: userData.password_hash || "",
            name: userData.name || "",
            avatar_url: userData.avatar_url || null,
            provider: userData.provider,
          },
        });

        if (userData.avatar_url) {
          await tx.user.update({
            where: {
              id: user.id,
            },
            data: {
              avatar_url: userData.avatar_url,
            },
          });
        }

        if (userData.foodPreferences?.length) {
          await tx.userPreference.createMany({
            data: userData.foodPreferences.map((foodId) => ({
              user_id: user.id,
              preference_id: foodId,
            })),
            skipDuplicates: true,
          });
        }

        if (userData.communityPreferences?.length) {
          await tx.userPreference.createMany({
            data: userData.communityPreferences.map((communityId) => ({
              user_id: user.id,
              preference_id: communityId,
            })),
            skipDuplicates: true,
          });
        }

        return user;
      });
      return result;
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      throw error;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { email },
      });
      return result;
    } catch (error) {
      console.error("Error al buscar usuario por email:", error);
      throw error;
    }
  }

  // MÉTODO AGREGADO: updateAvatar
  async updateAvatar(userId: number, avatarUrl: string): Promise<User> {
    try {
      const result = await prisma.user.update({
        where: { id: userId },
        data: { avatar_url: avatarUrl },
      });
      return result;
    } catch (error) {
      console.error("Error al actualizar avatar:", error);
      throw error;
    }
  }

  async getById(userId: number): Promise<User | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true
        }
      });
      return result;
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error);
      throw error;
    }
  }

  async update(userId: number, data: any) {
    try {
      const result = await prisma.user.update({
        where: { id: userId },
        data,
      });
      return result;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  }
}