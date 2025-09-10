import { Request, Response } from 'express';
import { sendBusinessContactEmail } from '../services/contact.service';

export const handleBusinessContact = async (req: Request, res: Response) => {
  try {
    const formData = req.body;

    // Validación básica de los campos requeridos
    if (!formData.name || !formData.email || !formData.businessName || !formData.businessLocation) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const result = await sendBusinessContactEmail(formData);

    if (result.success) {
      return res.status(200).json({ message: 'Mensaje enviado con éxito.' });
    } else {
      return res.status(500).json({ message: 'Hubo un error al enviar el mensaje.' });
    }
  } catch (error) {
    console.error('Error en el controlador de contacto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};