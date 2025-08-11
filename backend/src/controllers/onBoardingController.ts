import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nueva función que obtiene todas las categorías de comida y todos los tags de comunidad
export const getOnboardingData = async (req: Request, res: Response) => {
  try {
    // Obtener todas las categorías de comida
    const foodCategories = await prisma.foodCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        tipo: true,
        icon_url: true,
      },
      orderBy: [
        { tipo: 'asc' },
        { name: 'asc' }
      ]
    });

    // Obtener todos los tags de comunidad activos
    const communityTags = await prisma.communityTag.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        category: {
            select: {
                id: true,
                name: true
            }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      foodCategories,
      communityTags
    });

  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener los datos de onboarding',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Mantener getFoodCategoriesByType si aún la necesitas para otras rutas
export const getFoodCategoriesByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    const validTypes = ['Tipos_de_comida', 'Estilos_o_dietas', 'Origen_y_cultura'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Tipo de categoría inválido',
        validTypes
      });
    }

    const categories = await prisma.foodCategory.findMany({
      where: {
        tipo: type as 'Tipos_de_comida' | 'Estilos_o_dietas' | 'Origen_y_cultura'
      },
      select: {
        id: true,
        name: true,
        description: true,
        tipo: true,
        icon_url: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching food categories by type:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener las categorías por tipo',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};