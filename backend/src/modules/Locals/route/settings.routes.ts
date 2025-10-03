import { Router } from "express";
import { SettingsController } from "../controller/settings.controller"; 
import { createClient } from '@supabase/supabase-js'; // 💡 Importar Supabase
import multer from 'multer'; // 💡 Importar Multer
import { v4 as uuidv4 } from 'uuid'; // 💡 Importar UUID

const router = Router();

// --- CONFIGURACIÓN DE SUPABASE Y MULTER ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'menu'; // 🚨 ASUME QUE USAS EL MISMO BUCKET 'menu'

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

// Configuración de multer para la memoria
const upload = multer({ storage: multer.memoryStorage() });
// ------------------------------------------

// --- ENDPOINT DE SUBIDA DE IMAGEN DEL LOCAL ---

router.post('/upload-local-image/:localId', upload.single('image'), async (req, res) => {
  const localId = req.params.localId;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha enviado ningún archivo de imagen.' });
  }
  if (!localId) {
    return res.status(400).json({ message: 'Local ID no proporcionado en la ruta.' });
  }

  try {
    const file = req.file;
    const filePath = `local_images/${localId}/${uuidv4()}-${file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('Error al subir a Supabase:', uploadError);
      return res.status(500).json({ message: 'Error al subir la imagen a Supabase.' });
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    res.status(200).json({ url: publicUrlData.publicUrl });

  } catch (err) {
    console.error('Error del servidor:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});
// --- RUTAS DE CONFIGURACIÓN GENERAL DEL LOCAL ---

router.get(
    "/:localId", 
    SettingsController.getLocalSettings
);

router.put(
    "/:localId", 
    SettingsController.updateLocalSettings
);

router.get(
    "/:localId/schedule", 
    SettingsController.getLocalSchedules
);

router.put(
    "/:localId/schedule", 
    SettingsController.updateLocalSchedules
);

export default router;