import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { generateUniqueSlug } from "../utils/sluglify";

import { prisma } from "../prisma/prisma";

export const createBusinessUserAndLocal = async (
  userData: { name: string; email: string; password: string },
  businessData: any,
  localData: any
) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const model = prisma.user;

    const result = await prisma.$transaction(async (prisma) => {
      // 1. Crear el usuario con is_business = true
      const userSlug = await generateUniqueSlug(userData.name.trim(), model);
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          slug: userSlug,
          email: userData.email,
          password_hash: hashedPassword,
          is_business: true,
          role: "user",
        },
      });

      // 2. Crear el negocio y asociarlo al usuario
      const business = await prisma.business.create({
        data: {
          ...businessData,
          owner_id: user.id,
        },
      });

      // 3. Crear el local y asociarlo al negocio
      const local = await prisma.local.create({
        data: {
          ...localData,
          business_id: business.id,
        },
      });

      return { user, business, local };
    });

    return { success: true, ...result };
  } catch (error) {
    console.error("Error creating business user and local:", error);
    throw new Error("Could not create business user, business, and local.");
  }
};
