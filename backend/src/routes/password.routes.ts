import { Router } from 'express';
import { PasswordService} from '../services/passwordService';
import { PasswordController } from '../controllers/passwordController';


const router = Router();
const resetService = new PasswordService();
const resetController = new PasswordController(resetService);

router.post('/password_reset', resetController.requestReset.bind(resetController));

router.post('/password_reset/validate-code', resetController.validateCode.bind(resetController));

router.post('/password_reset/reset', resetController.reset.bind(resetController));


export default router;
