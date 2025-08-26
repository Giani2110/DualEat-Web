import { Router } from 'express';
import multer from 'multer'; // 👈 Importa multer aquí
import { uploadMenuController } from '../controllers/localDashboard.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post(
    '/local/:localId/menu-upload',
    upload.single('menuImage'),
    uploadMenuController
  );
export default router;