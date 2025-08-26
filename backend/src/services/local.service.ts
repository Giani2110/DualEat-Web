import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLocals = async () => {
  return prisma.local.findMany();
};

export const getLocalById = async (localId: number) => {
  return prisma.local.findUnique({
    where: { id: localId },
  });
};

export const updateLocal = async (localId: number, localData: any) => {
  return prisma.local.update({
    where: { id: localId },
    data: localData,
  });
};

export const deleteLocal = async (localId: number) => {
  return prisma.local.delete({
    where: { id: localId },
  });
};