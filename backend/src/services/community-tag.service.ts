import { prisma } from "../prisma/prisma";
import { CommunityTag } from "@prisma/client";

export class CommunityTagService {
  constructor() {}

  async createCommunityTag (data: CommunityTag) {
     try {
      return await prisma.communityTag.create({
        data,
      });
    } catch (error) {
      throw new Error(`Failed to create community tag: ${error}`);
    }
  }
  
  async getByIdCommunityTag(id: number) {
    try {
      return await prisma.communityTag.findUnique({
        where: { id },
        include: {
          category: true,
        }
      });
    } catch (error) {
      throw new Error(`Failed to get community tags: ${error}`);
    }
  }

  async getAllCommunityTags() {
    try {
      return await prisma.communityTag.findMany({
        include: {
          category: true,
        }
      });
    } catch (error) {
      throw new Error(`Failed to get community tags: ${error}`);
    }
  }

  async updateCommunityTag(id: number, data: any) {
    try {
      return await prisma.communityTag.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error(`Failed to update community tag: ${error}`);
    }
  }

  async deleteCommunityTag(id: number) {
    try {
      return await prisma.communityTag.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete community tag: ${error}`);
    }
  }
}
