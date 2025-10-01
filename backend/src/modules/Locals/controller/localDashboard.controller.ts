import { Request, Response } from 'express';
import { processMenuImage, MenuDish } from '../../../services/menu.service';
import multer from 'multer';
import path from 'path';
import { generateQrForLocal } from '../service/qr.service';
import { createFoodsFromOcr } from '../service/food.service';

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
    const localId = parseInt(req.params.localId);
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen.' });
    }

    const result = await processMenuImage(req.file.path);
    const validDishes = result.dishes;

    if (validDishes.length === 0) {
      return res.status(422).json({ error: 'No se pudieron extraer platos válidos.' });
    }

    res.status(200).json({
      success: true,
      message: 'Imagen procesada con éxito. Por favor, revise los platos extraídos.',
      dishes: validDishes,
    });

  } catch (error) {
    console.error('Error en uploadMenuController:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
};

export const bulkSaveFoodsController = async (req: Request, res: Response) => {
    try {
        const localId = parseInt(req.params.localId);
        const dishesToSave: MenuDish[] = req.body.dishes;

        if (!Array.isArray(dishesToSave) || dishesToSave.length === 0) {
            return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser un array de platos no vacío.' });
        }

        const savedFoods = await createFoodsFromOcr(localId, dishesToSave);

        res.status(200).json({
            success: true,
            data: savedFoods,
        });

    } catch (error) {
        console.error('Error en bulkSaveFoodsController:', error);
        res.status(500).json({ error: 'Error al guardar los platos extraídos.' });
    }
};

export const uploadMiddleware = upload.single('menuImage');