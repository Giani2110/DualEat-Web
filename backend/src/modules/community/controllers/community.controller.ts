import { Request, Response } from "express";
import { CommunityService } from "../services/community.service";

import { supabaseAdmin } from "../../../config/supabase";

export class CommunityController {
  constructor(private communityService: CommunityService) {}

  async create(req: Request, res: Response) {
    const { name, description, visibility, selectedTags, creatorId } = req.body;

    let themeColor: string | null = null;
    let imageUrl: string | null = null;

    try {
      const parsedCreatorId = parseInt(creatorId, 10);
      if (isNaN(parsedCreatorId)) {
        return res
          .status(400)
          .json({ error: "El ID del usuario no es válido." });
      }
      // Subir banner si existe
      if (req.files && (req.files as any).banner) {
        const bannerFile = (req.files as any).banner[0];
        const bannerPath = `banner_${Date.now()}_${bannerFile.originalname}`;

        const { error } = await supabaseAdmin.storage
          .from("community")
          .upload(bannerPath, bannerFile.buffer, {
            contentType: bannerFile.mimetype,
            upsert: true,
          });
        if (error) throw error;

        const { data: bannerPublic } = supabaseAdmin.storage
          .from("community")
          .getPublicUrl(bannerPath);

        themeColor = bannerPublic.publicUrl;
      }

      // Subir icono si existe
      if (req.files && (req.files as any).icon) {
        const iconFile = (req.files as any).icon[0];
        const iconPath = `icon_${Date.now()}_${iconFile.originalname}`;

        const { error } = await supabaseAdmin.storage
          .from("community")
          .upload(iconPath, iconFile.buffer, {
            contentType: iconFile.mimetype,
            upsert: true,
          });
        if (error) throw error;

        const { data: iconPublic } = supabaseAdmin.storage
          .from("community")
          .getPublicUrl(iconPath);

        imageUrl = iconPublic.publicUrl;
      }

      // Crear la comunidad en la DB
      const community = await this.communityService.createCommunity({
        name,
        description,
        image_url:
          imageUrl ||
          "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg",
        theme_color: themeColor || "#e5a657",
        visibility,
        creator_id: parsedCreatorId,
        selectedTags: Array.isArray(selectedTags) ? selectedTags : [],
      });

      return res.status(201).json({ success: true, data: community });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /** JOIN COMMUNITY */
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

  /** LEAVE COMMUNITY */
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

  /** GET COMMUNITY (by name) */
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

  /** GET ALL COMMUNITIES */
  async getAll(req: Request, res: Response) {
    const { take } = req.query;
    try {
      const communities = await this.communityService.getAllCommunities(
        Boolean(take)
      );
      res.status(200).json({ success: true, data: communities });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /** GET RECOMMENDED COMMUNITIES */
  async getRecommended(req: Request, res: Response) {
    const { user_id } = req.query;
    try {
      const communities = await this.communityService.getRecommendedCommunities(
        Number(user_id)
      );
      res.status(200).json({ success: true, data: communities });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPopular(req: Request, res: Response) {
    try {
      const communities = await this.communityService.getPopularCommunities();
      res.status(200).json({ success: true, data: communities });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getTrending(req: Request, res: Response) {
    try {
      const communities = await this.communityService.getTrendingCommunities();
      res.status(200).json({ success: true, data: communities });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getByTag(req: Request, res: Response) {
    const { tagId } = req.query;

    console.log(tagId);
    try {
      const communities = await this.communityService.getCommunitiesByTag(
        Number(tagId)
      );
      res.status(200).json({ success: true, data: communities });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /** LIST COMMUNITY MEMBERS */
  async listMembers(req: Request, res: Response) {
    const { communityId } = req.params;
    const members = await this.communityService.getCommunityMembers(
      Number(communityId)
    );
    res.status(200).json(members);
  }

  /** LIST USER COMMUNITIES */
  async listUserCommunities(req: Request, res: Response) {
    const { user_id } = req.query;

    // Validate that user_id exists and is a number
    if (!user_id || isNaN(Number(user_id))) {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario es inválido o no se proporcionó.",
      });
    }

    try {
      const communities = await this.communityService.getUserCommunities(
        Number(user_id)
      );
      res.status(200).json({ success: true, data: communities });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "No se pudo obtener las comunidades",
      });
    }
  }
}
