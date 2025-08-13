import { Router } from 'express';
import multer from 'multer';
import { generateQrCodeController, uploadMenuController } from '../controllers/localDashboard.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/:localId', generateQrCodeController);
router.post('/menu-upload', upload.single('menuImage'), uploadMenuController);

export default router;