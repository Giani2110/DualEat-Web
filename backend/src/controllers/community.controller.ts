import { Request, Response } from "express";
import { CommunityService } from "../services/community.service";

export class CommunityController {
  constructor(private communityService: CommunityService) {}

  async create(req: Request, res: Response) {
    const {
      name,
      description,
      imageUrl,
      themeColor,
      visibility,
      selectedTags,
      creatorId,
    } = req.body;

    try {
      const community = await this.communityService.createCommunity({
        name,
        description,
        image_url: imageUrl || "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg",
        theme_color: themeColor,
        visibility,
        creator_id: creatorId,
        selectedTags,
      });

      res.status(201).json({ success: true, data: community });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async get(req: Request, res: Response) {
    const { name } = req.query;
    try {
      const community = await this.communityService.getCommunity(
        name as string
      );

      if (!community) {
        return res
          .status(404)
          .json({ success: false, message: "Comunidad no encontrada" });
      }

      res.status(200).json({ success: true, data: community });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const communities = await this.communityService.getAllCommunities();
      res.status(200).json({ success: true, data: communities });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async join(req: Request, res: Response) {
    const { user_id, community_id } = req.body;

    try {
      const member = await this.communityService.joinCommunity(
        Number(user_id),
        Number(community_id)
      );

      res.status(200).json({
        success: true,
        data: member,
        message: "Te uniste a la comunidad",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "No se pudo unir a la comunidad",
      });
    }
  }

  async leave(req: Request, res: Response) {
    const { userId, communityId } = req.body;
    try {
      const result = await this.communityService.leaveCommunity(
        Number(userId),
        Number(communityId)
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listMembers(req: Request, res: Response) {
    const { communityId } = req.params;
    const members = await this.communityService.getCommunityMembers(
      Number(communityId)
    );
    res.status(200).json(members);
  }

  async listUserCommunities(req: Request, res: Response) {
    const { user_id } = req.query;

    try {
      const communities = await this.communityService.getUserCommunities(
        Number(user_id)
      );
      res.status(200).json({ success: true, data: communities });
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message: error.message || "No se pudo obtener las comunidades",
        });
    }
  }
}
