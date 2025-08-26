import { Request, Response } from "express";
import { CommunityTagService } from "../services/community-tag.service";

export class CommunityTagController {
  constructor(private communityTagService: CommunityTagService) {}

  async create(req: Request, res: Response) {
    const { data } = req.body;
    try {
      const tag = await this.communityTagService.createCommunityTag(data);
      return res.status(201).json({ success: true, data: tag });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al crear la etiqueta" });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tags = await this.communityTagService.getAllCommunityTags();
      res.status(200).json({ success: true, data: tags });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al obtener las etiquetas" });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const tag = await this.communityTagService.getByIdCommunityTag(Number(id));
      if (tag) {
        res.status(200).json({ success: true, data: tag });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Etiqueta no encontrada" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al obtener la etiqueta" });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id, data } = req.body;
    try {
      const updatedTag = await this.communityTagService.updateCommunityTag(
        id,
        data
      );
      if (updatedTag) {
        res.status(200).json({ success: true, data: updatedTag });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Etiqueta no encontrada" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar la etiqueta" });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.body;
    try {
      const deleted = await this.communityTagService.deleteCommunityTag(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res
          .status(404)
          .json({ success: false, message: "Etiqueta no encontrada" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al eliminar la etiqueta" });
    }
  }
}
