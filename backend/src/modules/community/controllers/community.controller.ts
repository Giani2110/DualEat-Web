import { Request, Response } from "express";
import { CommunityService } from "../services/community.service";

import { supabaseAdmin } from "../../../config/supabase";

export class CommunityController {
  constructor(private communityService: CommunityService) {}

  /** CREATE COMMUNITY */
  async create(req: Request, res: Response) {
    const { name, description, visibility, selectedTags, creatorId } = req.body;

    if (!name || !description || !visibility || !selectedTags || !creatorId) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    let tagsArray: number[] = [];
    let themeColor: string | null = null;
    let imageUrl: string | null = null;


    try {
      const creator_id = String(creatorId);

      if (typeof creator_id !== 'string' || creator_id.length === 0) {
     return res.status(400).json({ error: "El ID del creador no es válido." });
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

        if (!bannerPublic.publicUrl) {
          return res.status(400).json({ error: "Error al subir la imagen." });
        }

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

        if (!iconPublic.publicUrl) {
          return res.status(400).json({ error: "Error al subir la imagen." });
        }

        imageUrl = iconPublic.publicUrl;
      }

      tagsArray = JSON.parse(selectedTags);

      
      // Crear la comunidad en la DB
      const community = await this.communityService.createCommunity({
        name,
        description,
        image_url:
          imageUrl ||
          "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg",
        theme_color: themeColor || "#e5a657",
        visibility,
        creator_id,
        selectedTags: tagsArray,
        //selectedTags: Array.isArray(selectedTags) ? selectedTags : [],
      });

      return res.status(201).json({ success: true, data: community });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /** JOIN COMMUNITY */
  async join(req: Request, res: Response) {
    const { community_id } = req.body;
    const user_id = (req as any).user?.id;

    try {
      const member = await this.communityService.joinCommunity(
        String(user_id),
        String(community_id)
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
    const { community_id } = req.body;
    const user_id = (req as any).user?.id;

    try {
      const result = await this.communityService.leaveCommunity(
        String(user_id),
        String(community_id)
      );
      res
        .status(200)
        .json({
          success: true,
          data: result,
          message: "Abandonaste la comunidad",
        });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** GET COMMUNITY (by slug) */
  async get(req: Request, res: Response) {
    const { slug } = req.query;
    const user_id = (req as any).user?.id;

    try {
      const community = await this.communityService.getCommunity(
        slug as string,
        user_id
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

  /** GET COMMUNITY POSTS */
  async getPosts(req: Request, res: Response) {
    const { communityId, page } = req.query;
    const user_id = (req as any).user?.id;

    try {
      const result = await this.communityService.getCommunityPosts(
        String(communityId),
        Number(page),
        String(user_id)
      );

      res.status(200).json({ success: true, ...result });
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
        String(user_id)
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

  /** GET USER COMMUNITIES */
  async getUserCommunities(req: Request, res: Response) {
     const user_id = (req as any).user?.id;

    // Validate that user_id exists and is a number
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario es inválido o no se proporcionó.",
      });
    }

    try {
      const communities = await this.communityService.getUserCommunities(
        user_id
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
