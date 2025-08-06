import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = (to: string, code: string): void => {
  const mailOptions: MailOptions = {
    from: `"DualEat Soporte" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Código de recuperación de contraseña: ${code}`,
    html: `
       <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; font-family:Arial, sans-serif; background-image: url('https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/BGEmail.png'); background-size: cover;">
        <tr>
          <td align="center" style="padding:40px 30px;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin:auto;">
              <tr>
                <td width="70" height="70" bgcolor="#b53325" style="border-radius:50%; text-align:center;">
                  <img src="https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/Logo_DualEat.png" alt="DualEat Logo" width="40" height="40" style="display:block; margin:auto;" border="0"/>
                </td>
              </tr>
            </table>
            <h1 style="font-size:24px; color:#141212; margin-top:20px;">Código de recuperación de contraseña</h1>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:30px 40px; background-color:#f7f7f7;">
            <p style="font-size:16px; color:#666;">Este es tu código de recuperación de contraseña:</p>
            <h2 style="font-size:32px; color:#222; letter-spacing:10px;">${code}</h2>
            <p style="font-size:16px; color:#666;">Este código es válido por 10 minutos.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:20px;">
            <p style="font-size:14px; color:#666; max-width:400px; margin:auto;">
              Si no hiciste esta solicitud, cambia la contraseña de tu cuenta de inmediato para evitar más accesos no autorizados.
              Consulta en la <span style="color:#b53325; text-decoration:underline;">Guía de Inicio Rápido</span> para aprender a restablecer tu contraseña.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:20px; font-size:12px; color:#999;">
            <p>Este es un correo de notificación de servicio.</p>
            <p>DualEat S.A. Av. del Sabor 1234, Buenos Aires, Argentina © 2025 DualEat. Todos los derechos reservados.</p>
            <p>© 2025 DualEat S.A. DualEat, su logotipo, y todos los nombres relacionados con sus servicios son marcas registradas.</p>
          </td>
        </tr>
    </table>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error enviando correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
};
