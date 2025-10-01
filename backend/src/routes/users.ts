import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/:userId/local', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const localUser = await prisma.localUser.findFirst({
        where: { user_id: userId },
        include: {
          local: {
            include: {
              foods: true,
              local_users: true,
            },
          },
        },
      });
  
      if (!localUser) {
        return res.status(404).json({ message: 'Local no encontrado' });
      }
  
      res.json(localUser.local);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

export default router;