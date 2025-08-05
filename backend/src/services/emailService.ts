import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = (to: string, code: string): void => {
  const mailOptions: MailOptions = {
    from: `"DualEat Soporte" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Recuperación de contraseña',
    html: `
      <h1>Hola,</h1>
      <p>Has solicitado restablecer tu contraseña. Usa el siguiente código:</p>
      <h2 style="color: #e63946;">${code}</h2>
      <p>Este código es válido por 10 minutos.</p>
      <p>Si no fuiste tú, ignora este correo.</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error enviando correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
};
