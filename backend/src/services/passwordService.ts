import { prisma } from "../providers/prisma";
import { sendPasswordResetEmail } from "../services/emailService";

import { hashPassword } from "../utils/hash";

export class PasswordService {
  constructor() {}

  /**
   * Solicita un código de recuperación de contraseña
   */
  async requestReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { email },
      data: {
        reset_code: code,
        reset_expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
      },
    });

    sendPasswordResetEmail(email, code);
  }

  /**
   * Valida el código ingresado por el usuario
   */
  async validateCode(email: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.reset_code !== code ||
      !user.reset_expires_at ||
      user.reset_expires_at < new Date()
    ) {
      return false;
    }

    return true;
  }
 
  /**
   * Cambia la contraseña del usuario si el código es válido
   */
  async resetPassword(
    email: string,
    newPassword: string
  ): Promise<void> {

    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { email },
      data: {
        password_hash: hashedPassword,
        reset_code: null,
        reset_expires_at: null,
      },
    });
  }
}
