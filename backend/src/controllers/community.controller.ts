import { Request, Response } from "express";
import { CommunityService } from "../services/community.service";

const service = new CommunityService();

export class CommunityController {
  async join(req: Request, res: Response) {
    const { userId, communityId } = req.body;
    try {
      const member = await service.joinCommunity(Number(userId), Number(communityId));
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async leave(req: Request, res: Response) {
    const { userId, communityId } = req.body;
    try {
      const result = await service.leaveCommunity(Number(userId), Number(communityId));
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listMembers(req: Request, res: Response) {
    const { communityId } = req.params;
    const members = await service.getCommunityMembers(Number(communityId));
    res.json(members);
  }

  async listUserCommunities(req: Request, res: Response) {
    const { userId } = req.params;
    const communities = await service.getUserCommunities(Number(userId));
    res.json(communities);
  }
}
