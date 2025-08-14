import { Request, Response } from 'express';
import { processMenuImage, MenuDish } from '../services/menu.service';
import multer from 'multer';
import path from 'path';
import { generateQrForLocal } from '../services/qr.service';

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
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No se subió ninguna imagen.',
        details: 'Debe proporcionar un archivo de imagen válido.'
      });
    }

    const result = await processMenuImage(req.file.path);
    
    const validDishes = result.dishes;

    if (validDishes.length === 0) {
      return res.status(422).json({
        error: 'No se pudieron extraer platos válidos del menú.',
        details: 'Los datos extraídos no cumplen con los criterios de validación.',
        processingInfo: result.processingInfo
      });
    }

    // El controlador ahora retorna la lista de platos sin agrupar por categorías
    res.status(200).json({
      success: true,
      message: 'Imagen del menú procesada exitosamente.',
      data: {
        totalDishes: validDishes.length,
        dishes: validDishes
      },
      processingInfo: {
        ocrConfidence: result.processingInfo.confidence,
        detectedLanguage: result.processingInfo.detectedLanguage,
        textLength: result.processingInfo.rawText.length
      }
    });

  } catch (error: any) {
    console.error('Error en uploadMenuController:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor.',
      details: 'Ocurrió un error inesperado al procesar la imagen.'
    });
  }
};

export const uploadMiddleware = upload.single('menuImage');