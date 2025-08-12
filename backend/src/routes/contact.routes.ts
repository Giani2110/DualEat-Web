import { Router } from 'express';
import { handleBusinessContact } from '../controllers/contactController';

const contactRouter = Router();

contactRouter.post('/business', handleBusinessContact);

export default contactRouter;