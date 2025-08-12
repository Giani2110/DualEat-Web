import nodemailer from 'nodemailer';
import { ContactFormData } from '../interfaces/contact.interface';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBusinessContactEmail = async (data: ContactFormData) => {
  const { name, email, phone, businessName, businessLocation, message, newsletter } = data;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'dualeat.contacto@gmail.com',
    subject: `Nuevo contacto de negocio de DualEat: ${businessName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #b53325; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nuevo Contacto de Negocio</h1>
          </div>
          <div style="padding: 25px;">
            <p style="font-size: 16px; color: #333333; line-height: 1.6;">
              ¡Hola! Has recibido un nuevo mensaje de un negocio interesado en unirse a DualEat.
              A continuación, se presentan los detalles del contacto:
            </p>
            <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <h3 style="color: #333333; margin-top: 0;">Información del negocio</h3>
              <p style="margin: 5px 0; color: #555555;"><strong>Nombre del Contacto:</strong> ${name}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>Correo Electrónico:</strong> <a href="mailto:${email}" style="color: #b53325; text-decoration: none;">${email}</a></p>
              <p style="margin: 5px 0; color: #555555;"><strong>Teléfono:</strong> ${phone || 'No especificado'}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>Nombre del Local:</strong> ${businessName}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>Ubicación del Local:</strong> ${businessLocation}</p>
            </div>
            
            <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <h3 style="color: #333333; margin-top: 0;">Mensaje del negocio</h3>
              <p style="font-size: 16px; color: #555555; line-height: 1.6;">${message || 'El negocio no dejó un mensaje.'}</p>
            </div>

            <div style="margin-top: 25px; font-size: 14px; color: #777777;">
              <p>El contacto ${newsletter ? 'sí' : 'no'} desea recibir información de DualEat.</p>
            </div>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center; color: #999999; font-size: 12px;">
            <p>Este es un correo automático. Por favor, no respondas a este mensaje.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de contacto de negocio enviado con éxito.');
    return { success: true, message: 'Correo enviado.' };
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return { success: false, message: 'Error al enviar el correo.' };
  }
};