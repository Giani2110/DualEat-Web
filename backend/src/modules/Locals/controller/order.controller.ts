import { Request, Response } from "express";
import { OrderService } from "../service/order.service";

export class OrderController {
  static async getOrders(req: Request, res: Response) {
    try {
      const localId = parseInt(req.params.id);
      const { status, from, to } = req.query;

      if (isNaN(localId)) {
        return res.status(400).json({ error: "El ID del local no es válido." });
      }

      const orders = await OrderService.getOrders(localId, status as string, from as string, to as string);

      return res.json(orders);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
