import { prisma } from "../../prisma/prisma";

import { AskAI, PaginatedResponse } from "../../interfaces/recipe.dto";

export class RecipeService {
  constructor() {}

  /** GET INGREDIENTS */
  async getAllIngredients() {
    try {
      const result = await prisma.ingredient.findMany();
      return result;
    } catch (error) {
      throw new Error(`Error al obtener ingredientes: ${error}`);
    }
  }

  /** GET UNITS */
  async getAllUnits() {
    try {
      const result = await prisma.unitOfMeasure.findMany({
        orderBy: { name: "asc" },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener unidades: ${error}`);
    }
  }

  /** GET RECIPE BY NAME (Validation) */
  async getRecipeValidation(name: string, userId: string, communityId: string) {
    try {
      const result = await prisma.recipe.findFirst({
        where: {
          user_id: userId,
          name: {
            equals: name,
            mode: "insensitive",
          },
          posts: {
            some: {
              community_id: communityId,
            },
          },
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener receta: ${error}`);
    }
  }

  /** GET RECIPE BY ID */
  async getRecipeById(id: string) {
    try {
      const result = await prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              unit_of_measure: true,
              ingredient: true,
            },
          },
          steps: true,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener receta: ${error}`);
    }
  }

  /** GET RECIPE BY SLUG */
  async getRecipeBySlug(
    communitySlug: string,
    recipeSlug: string,
    userSlug: string
  ) {
    try {
      const result = await prisma.recipe.findFirst({
        where: {
          slug: recipeSlug,
          posts: {
            some: {
              community: { slug: communitySlug },
              user: { slug: userSlug },
            },
          },
        },
        include: {
          ingredients: {
            include: {
              unit_of_measure: true,
              ingredient: true,
            },
          },
          steps: true,
          posts: {
            include: {
              community: { select: { image_url: true, slug: true } },
              user: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener receta: ${error}`);
    }
  }

  /** GET USER RECIPES */
  async getUserRecipes(user_id: string) {
    try {
      const result = await prisma.recipe.findMany({
        where: { user_id },
        include: {
          ingredients: {
            include: {
              unit_of_measure: true,
              ingredient: true,
            },
          },
          steps: true,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener recetas: ${error}`);
    }
  }

  /** ASK OLLAMA */
  async ask(data: AskAI): Promise<PaginatedResponse<any>> {
    const page = data.page || 1;
    const limit = data.limit || 20;
    const skip = (page - 1) * limit;

    if (data.type === "recipe") {
      // Contar total de resultados
      const total = await prisma.recipe.count({
        where: {
          name: {
            contains: data.question,
            mode: "insensitive",
          },
        },
      });

      // Obtener resultados paginados
      const result = await prisma.recipe.findMany({
        where: {
          name: {
            contains: data.question,
            mode: "insensitive",
          },
        },
        include: {
          ingredients: true,
          steps: true,
          user: {
            select: {
              slug: true,
            },
          },
          posts: {
            select: {
              votes_up: true,
              community: {
                select: {
                  slug: true,
                },
              },
            },
            orderBy: {
              votes_up: "desc",
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          posts: {
            _count: "desc",
          },
        },
      });

      return {
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    }

    if (data.type === "ingredient") {
      // Contar total de resultados
      const total = await prisma.recipe.count({
        where: {
          ingredients: {
            some: {
              ingredient: {
                id: { in: data.ingredients },
              },
            },
          },
        },
      });

      // Obtener resultados paginados
      const result = await prisma.recipe.findMany({
        where: {
          ingredients: {
            some: {
              ingredient: {
                id: { in: data.ingredients },
              },
            },
          },
        },
        include: {
          ingredients: true,
          steps: true,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      });

      return {
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    }

    return {
      data: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}
