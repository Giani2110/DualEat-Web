import { Request, Response } from "express";
import { PasswordService } from "../services/passwordService";

export class PasswordController {
  constructor(private passwordService: PasswordService) {}

  async requestReset(req: Request, res: Response) {
    const { email } = req.body;
    try {
      await this.passwordService.requestReset(email);
      res.json({ success: true, message: "Código enviado" });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async validateCode(req: Request, res: Response) {
    const { email, code } = req.body;
    try {
      const isValid = await this.passwordService.validateCode(email, code);
      if (!isValid) throw new Error("Código inválido o expirado");
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async reset(req: Request, res: Response) {
    const { email, newPassword } = req.body;
    try {
      await this.passwordService.resetPassword(email, newPassword);
      res.json({ success: true, message: "Contraseña actualizada" });
     
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
