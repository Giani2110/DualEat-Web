import { Request, Response } from "express";
import { VoteService } from "./vote.service";

export class VoteController {
  constructor(private voteService: VoteService) {}

  /** CREATE VOTE */
  async create(req: Request, res: Response) {
    const { voteType, content_id, content_type } = req.body;
    const user_id = (req as any).user?.id;

    try {
      const vote = await this.voteService.createVote(
        voteType,
        content_id,
        content_type,
        user_id
      );

      if (vote.action === "deleted") {
        return res.status(200).json({ success: true, status: 204 });
      }
      if (vote.action === "updated") {
        return res.status(200).json({ success: true, data: vote, status: 200 });
      } else {
        return res.status(201).json({ success: true, data: vote, status: 201 });
      }


    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
