import { Request, Response } from "express";
import { CommunityService } from "../services/community.service";

export class CommunityController {
  constructor(private communityService: CommunityService) {}

  async create(req: Request, res: Response) {
  const { name, description, imageUrl, themeColor, visibility, selectedTags, creatorId } = req.body;

  try {
    const community = await this.communityService.createCommunity({
      name,
      description,
      image_url: imageUrl,
      theme_color: themeColor,
      visibility,
      creator_id: creatorId,
      selectedTags,
    });

    res.status(201).json(community);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

  async join(req: Request, res: Response) {
    const { userId, communityId } = req.body;
    try {
      const member = await this.communityService.joinCommunity(Number(userId), Number(communityId));
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async leave(req: Request, res: Response) {
    const { userId, communityId } = req.body;
    try {
      const result = await this.communityService.leaveCommunity(Number(userId), Number(communityId));
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listMembers(req: Request, res: Response) {
    const { communityId } = req.params;
    const members = await this.communityService.getCommunityMembers(Number(communityId));
    res.json(members);
  }

  async listUserCommunities(req: Request, res: Response) {
    const { userId } = req.params;
    const communities = await this.communityService.getUserCommunities(Number(userId));
    res.json(communities);
  }
}
