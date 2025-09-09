import { Router } from 'express';
import { generateQrCodeController } from '../controllers/localDashboard.controller';

const router = Router();

router.get('/qr/:localId', generateQrCodeController);

export default router;