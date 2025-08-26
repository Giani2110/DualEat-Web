import { Request, Response } from 'express';
import { processMenuImage, MenuDish } from '../services/menu.service';
import multer from 'multer';
import path from 'path';
import { generateQrForLocal } from '../services/qr.service';
import { createFoodsFromOcr } from '../services/food.service';

export const generateQrCodeController = async (req: Request, res: Response) => {
  try {
    const localId = parseInt(req.params.localId);
    
    if (isNaN(localId)) {
        return res.status(400).json({ error: 'ID de local no válido.' });
    }

    const qrResponse = await generateQrForLocal(localId);
    res.json(qrResponse);
  } catch (error: any) {
    if (error.message === 'Local no encontrado') {
        return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor al generar el código QR.' });
  }
};

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    cb(null, mimetype && extname);
  }
});

export const uploadMenuController = async (req: Request, res: Response) => {
  try {
    const localId = parseInt(req.params.localId); // asegúrate que localId venga en la ruta
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen.' });
    }

    const result = await processMenuImage(req.file.path);
    const validDishes = result.dishes;

    if (validDishes.length === 0) {
      return res.status(422).json({ error: 'No se pudieron extraer platos válidos.' });
    }

    // Guardar en DB
    const saved = await createFoodsFromOcr(localId, validDishes);

    res.status(200).json({
      success: true,
      message: 'Menú procesado y guardado.',
      data: saved
    });

  } catch (error) {
    console.error('Error en uploadMenuController:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
};

export const uploadMiddleware = upload.single('menuImage');