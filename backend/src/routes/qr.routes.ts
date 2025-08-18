import { Router } from 'express';
import { generateQrCodeController } from '../controllers/localDashboard.controller';

const router = Router();

router.get('/:localId', generateQrCodeController);

export default router;