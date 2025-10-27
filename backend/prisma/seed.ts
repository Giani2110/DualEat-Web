import {
  PrismaClient,
  TypesCategory,
  Role,
  SubscriptionStatus,
  LocalUserRole,
  PostType,
} from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";
import slugify from 'slugify';

const prisma = new PrismaClient();

const ingredientsFilePath = join(__dirname, "../..", "ingredientes.txt");

// =================================================================
// FUNCIÓN DE AYUDA PARA SLUG
function generateSlug(text: string): string {
    return slugify(text, { lower: true, strict: true, locale: 'es' });
}
// =================================================================
// DATOS PARA UNIDADES DE MEDIDA
const unitsOfMeasure = [
  { name: "gramos", abbreviation: "g" },
  { name: "kilogramos", abbreviation: "kg" },
  { name: "mililitros", abbreviation: "ml" },
  { name: "litros", abbreviation: "l" },
  { name: "cucharadita", abbreviation: "cdita" },
  { name: "cucharada", abbreviation: "cda" },
  { name: "taza", abbreviation: "taza" },
  { name: "unidad", abbreviation: "u" },
  { name: "pizca", abbreviation: "pizca" },
  { name: "paquete", abbreviation: "paquete" },
  { name: "opcional", abbreviation: "opcional" },
];
// DATOS PARA COMUNIDADES Y PREFERENCIAS DE USUARIOS
const tagData = [
  {
    category: {
      name: "Recetas y cocina",
      description: "Recetas para el día a día o momentos especiales.",
      icon_url: "🥘",
    },
    tags: [
      "Cocina con niños",
      "A la parrilla",
      "Microondas only",
      "Cocina económica",
      "Sin horno",
      "Cocina express",
    ],
  },
  {
    category: {
      name: "Estilos de vida",
      description: "Tags relacionados con dietas y estilos alimenticios.",
      icon_url: "🌿",
    },
    tags: [
      "Keto",
      "Vegano",
      "Vegetariano",
      "Sin TACC",
      "Sin azúcar",
      "Bajo en sodio",
      "Proteico",
      "Fitness",
      "Ayuno intermitente",
      "Paleo",
      "Raw food",
      "Mediterráneo",
      "Detox",
    ],
  },
  {
    category: {
      name: "Momentos especiales",
      description: "Platillos para celebrar o compartir.",
      icon_url: "🎉",
    },
    tags: [
      "Cena romántica",
      "Cumpleaños",
      "Navidad",
      "Año nuevo",
      "Día de la madre",
      "Aniversarios",
      "Primera cita",
      "Reunión familiar",
      "Graduaciones",
      "Despedida de soltero",
      "Día del padre",
    ],
  },
  // ... (El resto de tus datos de tagData) ...
  {
    category: {
      name: "Técnicas culinarias",
      description: "Conoce y practica técnicas de chef.",
      icon_url: "👨‍🍳",
    },
    tags: [
      "Sous vide",
      "Fermentación",
      "Ahumado casero",
      "Confitado",
      "Marinado",
      "Encurtidos",
      "Deshidratado",
      "Flameado",
      "Emulsificado",
      "Braseado",
      "Tempura",
      "Molecular",
    ],
  },
  {
    category: {
      name: "Tendencias foodie",
      description: "Lo último que se habla en el mundo gastronómico.",
      icon_url: "📱",
    },
    tags: [
      "Viral",
      "Street food",
      "Fusion cuisine",
      "Plant based",
      "Comfort food",
      "Artesanal",
      "Zero waste",
      "Superfoods",
    ],
  },
  {
    category: {
      name: "Presupuesto",
      description: "Consejos y recetas para ahorrar.",
      icon_url: "💰",
    },
    tags: [
      "Ingredientes baratos",
      "Aprovecha sobras",
      "Compra inteligente",
      "Ofertas del super",
      "Cocina de fin de mes",
      "Máximo rendimiento",
    ],
  },
  {
    category: {
      name: "Clima y estación",
      description: "Recetas apropiadas para cada época del año.",
      icon_url: "🌤️",
    },
    tags: [
      "Verano refrescante",
      "Día lluvioso",
      "Calor agobiante",
      "Frío polar",
      "Primavera renovadora",
      "Día de playa",
      "Picnic perfecto",
    ],
  },
  {
    category: {
      name: "Salud y Bienestar",
      description: "Comida que cuida de tu cuerpo y mente.",
      icon_url: "🧘‍♀️",
    },
    tags: [
      "Alimentación consciente",
      "Recetas antiinflamatorias",
      "Sin lactosa",
      "Bajo en colesterol",
      "Smoothies y jugos",
    ],
  },
];

// CATEGORÍAS GLOBALES DE COMIDA
const foodCategories = [
  // TIPOS DE COMIDA
  {
    name: "Carnes rojas",
    description: "Carne de res, cordero, cerdo y derivados",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🥩",
  },
  {
    name: "Aves y caza",
    description: "Pollo, pavo, pato, codorniz y aves de caza",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🍗",
  },
  {
    name: "Pescados y mariscos",
    description: "Pescados, mariscos, moluscos y frutos del mar",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🐟",
  },
  {
    name: "Pasta y fideos",
    description: "Pastas, fideos, ñoquis y masas",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🍝",
  },
  {
    name: "Arroz y cereales",
    description: "Arroz, quinoa, cebada, avena y otros cereales",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🍚",
  },
  {
    name: "Legumbres",
    description: "Lentejas, garbanzos, porotos y otras legumbres",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🫘",
  },
  {
    name: "Verduras y hortalizas",
    description: "Vegetales frescos, de hoja y de raíz",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🥬",
  },
  {
    name: "Frutas",
    description: "Frutas frescas, secas y procesadas",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🍎",
  },
  {
    name: "Lácteos y huevos",
    description: "Leche, quesos, yogur, manteca y huevos",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🥛",
  },
  {
    name: "Panificados",
    description: "Pan, facturas, galletitas y productos de panadería",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🍞",
  },
  {
    name: "Postres y dulces",
    description: "Tortas, helados, chocolates y repostería",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🍰",
  },
  {
    name: "Bebidas",
    description: "Jugos, gaseosas, aguas saborizadas y bebidas",
    tipo: TypesCategory.Tipos_de_comida,
    icon_url: "🥤",
  }, // ESTILOS O DIETAS

  {
    name: "Vegano",
    description: "Sin productos de origen animal",
    tipo: TypesCategory.Estilos_o_dietas,
    icon_url: "🌱",
  },
  {
    name: "Vegetariano",
    description: "Sin carne pero con lácteos y huevos",
    tipo: TypesCategory.Estilos_o_dietas,
    icon_url: "🥕",
  },
  {
    name: "Sin gluten",
    description: "Libre de trigo, avena, cebada y centeno",
    tipo: TypesCategory.Estilos_o_dietas,
    icon_url: "🚫",
  },
  {
    name: "Keto",
    description: "Alto en grasas, bajo en carbohidratos",
    tipo: TypesCategory.Estilos_o_dietas,
    icon_url: "🥑",
  },
  {
    name: "Paleo",
    description: "Alimentación paleolítica, sin procesados",
    tipo: TypesCategory.Estilos_o_dietas,
    icon_url: "🦴",
  },
  {
    name: "Diabético",
    description: "Bajo índice glucémico, sin azúcar refinada",
    tipo: TypesCategory.Estilos_o_dietas,
    icon_url: "💉",
  },
  {
    name: "Fitness",
    description: "Alto en proteínas, balanceado para deportistas",
    tipo: TypesCategory.Estilos_o_dietas,
    icon_url: "💪",
  }, // ORIGEN Y CULTURA

  {
    name: "Cocina argentina",
    description: "Platos tradicionales y regionales de Argentina",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🇦🇷",
  },
  {
    name: "Cocina italiana",
    description: "Pasta, pizza, risotto y especialidades italianas",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🇮🇹",
  },
  {
    name: "Cocina asiática",
    description: "Platos de China, Japón, Tailandia y Asia",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🥢",
  },
  {
    name: "Cocina mexicana",
    description: "Tacos, enchiladas y comida mexicana auténtica",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🇲🇽",
  },
  {
    name: "Cocina árabe",
    description: "Shawarma, falafel y especialidades del medio oriente",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🧿",
  },
  {
    name: "Cocina peruana",
    description: "Ceviche, anticuchos y gastronomía peruana",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🇵🇪",
  },
  {
    name: "Cocina española",
    description: "Paella, tapas y platos ibéricos",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🇪🇸",
  },
  {
    name: "Cocina francesa",
    description: "Haute cuisine y especialidades francesas",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🇫🇷",
  },
  {
    name: "Cocina americana",
    description: "Hamburguesas, BBQ y comida estadounidense",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🇺🇸",
  },
  {
    name: "Cocina brasileña",
    description: "Feijoada, açaí y especialidades brasileñas",
    tipo: TypesCategory.Origen_y_cultura,
    icon_url: "🇧🇷",
  },
];


async function main() {
  try {
    // ---- 1. Siembra de la tabla UnitOfMeasure ----
    await prisma.unitOfMeasure.createMany({
      data: unitsOfMeasure,
      skipDuplicates: true,
    });
    console.log(
      `✅ ${unitsOfMeasure.length} unidades de medida han sido insertadas.`
    );
    // ---------------------------------------------

    // ---- 2. Siembra de la tabla Ingredient ----
    const ingredientsFileContent = readFileSync(ingredientsFilePath, "utf-8");
    const ingredientNames = ingredientsFileContent
      .split("\n")
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line.length > 0);

    const ingredientsToCreate = ingredientNames.map((name) => ({
      name,
    }));

    await prisma.ingredient.createMany({
      data: ingredientsToCreate,
      skipDuplicates: true,
    });
    console.log(
      `✅ ${ingredientsToCreate.length} ingredientes han sido insertados.`
    );
    // ---------------------------------------------

    // ---- 3. Siembra de FoodCategory ----
    for (const category of foodCategories) {
      const existingCategory = await prisma.foodCategory.findFirst({
        where: { name: category.name },
      });

      if (!existingCategory) {
        await prisma.foodCategory.create({
          data: category,
        });
      }
    }
    console.log("Seed de FoodCategory completado ✅");
    // ---------------------------------------------

    // ---- 4. Siembra de TagCategory + CommunityTag (Añadir Slug a TagCategory) ----
    for (const item of tagData) {
      const categoryData = {
          ...item.category,
          slug: generateSlug(item.category.name) // Generar slug para TagCategory
      }

      let category = await prisma.tagCategory.findFirst({
        where: { name: item.category.name },
      });

      if (!category) {
        category = await prisma.tagCategory.create({
          data: categoryData,
        });
      } else {
         // Si ya existe, nos aseguramos de que tenga slug si lo hicimos requerido
         if (!category.slug) {
            await prisma.tagCategory.update({
                where: { id: category.id },
                data: { slug: categoryData.slug }
            });
         }
      }

      for (const tagName of item.tags) {
        const existingTag = await prisma.communityTag.findUnique({
          where: { name: tagName },
        });

        if (!existingTag) {
          await prisma.communityTag.create({
            data: {
              name: tagName,
              category_id: category.id,
              active: true,
            },
          });
        }
      }
    }
    console.log("Seed de TagCategory y CommunityTag completado ✅");
    // ---------------------------------------------

    // ---- 5. SEED DE USUARIOS (Añadir Slug) ----
    const usersData = [
      {
        name: "Carlos Gomez",
        email: "carlos.gomez@example.com",
        password_hash: "hash1",
        role: Role.admin,
        subscription_status: SubscriptionStatus.active,
        is_business: true,
      },
      {
        name: "Maria Lopez",
        email: "maria.lopez@example.com",
        password_hash: "hash2",
        subscription_status: SubscriptionStatus.active,
      },
      {
        name: "Juan Perez",
        email: "juan.perez@example.com",
        password_hash: "hash3",
      },
      {
        name: "Laura Rodriguez",
        email: "laura.rodriguez@example.com",
        password_hash: "hash4",
        is_business: true,
      },
      {
        name: "Pedro Martinez",
        email: "pedro.martinez@example.com",
        password_hash: "hash5",
      },
    ];

    const users = await Promise.all(
      usersData.map(async (user) => {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        const userDataWithSlug = {
          ...user,
          slug: generateSlug(user.name), // Generar slug
        };

        if (!existingUser) {
          return prisma.user.create({ data: userDataWithSlug });
        }
        return existingUser;
      })
    );
    console.log(
      `✅ ${users.length} usuarios han sido insertados o ya existen.`
    );
    // ---------------------------------------------

    // ---- 6. SEED DE NEGOCIOS (BUSINESS) ----
    const businessesData = [
      { name: "Parrilla El Fogon", owner_id: users[0].id },
      { name: "Pizzeria Napolitana", owner_id: users[3].id },
      { name: "Sushi-D", owner_id: users[0].id },
      { name: "Cafe de la Esquina", owner_id: users[3].id },
      { name: "Heladeria Fantasia", owner_id: users[0].id },
    ];

    const businesses = await Promise.all(
      businessesData.map(async (business) => {
        const existingBusiness = await prisma.business.findFirst({
          where: { name: business.name },
        });
        if (!existingBusiness) {
          return prisma.business.create({ data: business });
        }
        return existingBusiness;
      })
    );
    console.log(
      `✅ ${businesses.length} negocios han sido insertados o ya existen.`
    );
    // ---------------------------------------------

    // ---- 7. SEED DE LOCALES (Añadir Slug) ----
    const localsData = [
      {
        name: "Local El Fogon Centro",
        description: "La mejor parrilla del centro.",
        address: "Calle Falsa 123",
        image_url: "url_imagen_parrilla1",
        business_id: businesses[0].id,
      },
      {
        name: "Local Pizzeria Caballito",
        description: "Pizzas a la piedra.",
        address: "Av. Rivadavia 4567",
        image_url: "url_imagen_pizza1",
        business_id: businesses[1].id,
      },
      {
        name: "Local Sushi-D Belgrano",
        description: "Sushi fresco y delicioso.",
        address: "Av. Cabildo 100",
        image_url: "url_imagen_sushi1",
        business_id: businesses[2].id,
      },
      {
        name: "Local Cafe Palermo",
        description: "Cafe de especialidad.",
        address: "Uriarte 2000",
        image_url: "url_imagen_cafe1",
        business_id: businesses[3].id,
      },
      {
        name: "Local Heladeria Fantasia Norte",
        description: "Helados artesanales.",
        address: "Av. Libertador 5000",
        image_url: "url_imagen_helado1",
        business_id: businesses[4].id,
      },
    ];

    const locals = await Promise.all(
      localsData.map(async (local) => {
        const existingLocal = await prisma.local.findFirst({
          where: { name: local.name },
        });

        const localDataWithSlug = {
            ...local,
            slug: generateSlug(local.name) // Generar slug
        }

        if (!existingLocal) {
          return prisma.local.create({ data: localDataWithSlug });
        }
        return existingLocal;
      })
    );
    console.log(
      `✅ ${locals.length} locales han sido insertados o ya existen.`
    );
    // ---------------------------------------------

    // ---- 8. SEED DE LOCALUSERS ----
    const localUsersData = [
      {
        user_id: users[0].id,
        local_id: locals[0].id,
        role: LocalUserRole.admin,
      },
      {
        user_id: users[1].id,
        local_id: locals[1].id,
        role: LocalUserRole.staff,
      },
      {
        user_id: users[2].id,
        local_id: locals[2].id,
        role: LocalUserRole.staff,
      },
      {
        user_id: users[3].id,
        local_id: locals[3].id,
        role: LocalUserRole.admin,
      },
      {
        user_id: users[4].id,
        local_id: locals[4].id,
        role: LocalUserRole.staff,
      },
    ];

    await prisma.localUser.createMany({
      data: localUsersData,
      skipDuplicates: true,
    });
    console.log(`✅ ${localUsersData.length} LocalUsers han sido insertados.`);
    // ---------------------------------------------

    // ---- 9. SEED DE FOODS (Añadir Slug) ----
    const foodsData = [
      {
        local_id: locals[0].id,
        name: "Asado de tira",
        description: "Costillar de novillo a la parrilla.",
        price: 5500,
        image_url: "url_asado",
      },
      {
        local_id: locals[0].id,
        name: "Bife de chorizo",
        description: "Bife de chorizo de 400gr.",
        price: 6000,
        image_url: "url_bife",
      },
      {
        local_id: locals[1].id,
        name: "Pizza Muzzarella",
        description: "La clasica pizza de muzzarella.",
        price: 3000,
        image_url: "url_muzza",
      },
      {
        local_id: locals[1].id,
        name: "Pizza Calabresa",
        description: "Pizza de muzzarella y longaniza.",
        price: 3800,
        image_url: "url_calabresa",
      },
      {
        local_id: locals[2].id,
        name: "Roll Philadelphia",
        description: "Roll de salmon y queso philadelphia.",
        price: 4500,
        image_url: "url_roll",
      },
    ];

    const foods = await Promise.all(
      foodsData.map(async (food) => {
        const existingFood = await prisma.food.findFirst({
          where: { name: food.name, local_id: food.local_id },
        });

        const foodDataWithSlug = {
            ...food,
            // Generamos un slug compuesto: nombre + local_id (solo los primeros 4 caracteres)
            slug: generateSlug(`${food.name}-${food.local_id.substring(0, 4)}`) 
        }

        if (!existingFood) {
          return prisma.food.create({ data: foodDataWithSlug });
        }
        return existingFood;
      })
    );
    console.log(
      `✅ ${foods.length} alimentos han sido insertados o ya existen.`
    );
    // ---------------------------------------------

    // ---- 10. SEED DE RECIPES (Añadir Slug) ----
    const recipesData = [
      {
        user_id: users[0].id,
        name: "Tarta de pollo",
        description: "Una receta simple y rica para el almuerzo.",
        main_image: "https://via.placeholder.com/300"
      },
      {
        user_id: users[1].id,
        name: "Guacamole casero",
        description: "La mejor receta de guacamole.",
        main_image: "https://via.placeholder.com/300"
      },
      {
        user_id: users[2].id,
        name: "Brownies de chocolate",
        description: "Brownies humedos y deliciosos.",
        main_image: "https://via.placeholder.com/300"
      },
      {
        user_id: users[3].id,
        name: "Hamburguesas caseras",
        description: "Hamburguesas con pan brioche.",
        main_image: "https://via.placeholder.com/300"
      },
      {
        user_id: users[4].id,
        name: "Pasta con pesto",
        description: "Pasta fresca con pesto de albahaca.",
        main_image: "https://via.placeholder.com/300"
      },
    ];

    const recipes = await Promise.all(
      recipesData.map(async (recipe) => {
        const existingRecipe = await prisma.recipe.findFirst({
          where: { name: recipe.name, user_id: recipe.user_id },
        });

        const recipeDataWithSlug = {
            ...recipe,
            slug: generateSlug(recipe.name) // Generar slug
        }

        if (!existingRecipe) {
          return prisma.recipe.create({ data: recipeDataWithSlug });
        }
        return existingRecipe;
      })
    );
    console.log(
        `✅ ${recipes.length} recetas han sido insertadas o ya existen.`
    );
    // ---------------------------------------------

    // ---- 11. SEED DE COMMUNITIES (Añadir Slug) ----
    const communityTags = await prisma.communityTag.findMany({ select: { id: true } });
    const communityData = [
        {
            name: "Comunidad Vegana Argentina",
            description: "Recetas y tips para un estilo de vida vegano en Argentina.",
            creator_id: users[1].id,
            total_members: 10,
            image_url: "url_vegana",
            tags: [communityTags.find(t => t.id === 15)?.id, communityTags.find(t => t.id === 1)?.id] // Asumiendo IDs por orden
        },
        {
            name: "Los Amantes de la Parrilla",
            description: "Todo sobre asados, cortes y técnicas de parrilla.",
            creator_id: users[0].id,
            total_members: 50,
            image_url: "url_parrilla",
            tags: [communityTags.find(t => t.id === 2)?.id, communityTags.find(t => t.id === 1)?.id]
        }
    ];

    const communities = await Promise.all(
        communityData.map(async (comm) => {
            const existingCommunity = await prisma.community.findFirst({
                where: { name: comm.name },
            });
            
            // Separar las tags del objeto principal para la creación
            const tagsToConnect = comm.tags.filter(id => id !== undefined).map(id => ({ id: id! }));

            const communityDataWithSlug = {
                ...comm,
                slug: generateSlug(comm.name)
            }
            
            // Eliminar 'tags' del objeto de datos antes de la creación
            const { tags, ...dataToCreate } = communityDataWithSlug; 

            if (!existingCommunity) {
                return prisma.community.create({
                    data: {
                        ...dataToCreate,
                        tags: {
                            connect: tagsToConnect,
                        },
                    },
                });
            }
            return existingCommunity;
        })
    );
    console.log(`✅ ${communities.length} comunidades han sido insertadas o ya existen.`);
    // ---------------------------------------------

    // ---- 12. SEED DE POSTS (Añadir Slug) ----
    const postsData = [
        {
            title: "Mi primera tarta de pollo",
            content: "¡Sigan la receta y me cuentan!",
            user_id: users[0].id,
            community_id: communities[0].id,
            type: PostType.recipe,
            recipe_id: recipes[0].id
        },
        {
            title: "¿Que corte de carne recomiendan para un asado?",
            content: "Quiero hacer un asado el fin de semana y necesito consejos.",
            user_id: users[2].id,
            community_id: communities[1].id,
            type: PostType.post
        }
    ];

    await Promise.all(
        postsData.map(async (post) => {
            const existingPost = await prisma.post.findFirst({
                where: { title: post.title, community_id: post.community_id },
            });
            
            // Generar slug
            const postDataWithSlug = {
                ...post,
                slug: generateSlug(post.title)
            }

            if (!existingPost) {
                return prisma.post.create({ data: postDataWithSlug });
            }
            return existingPost;
        })
    );
    console.log(`✅ ${postsData.length} posts han sido insertados o ya existen.`);
    // ---------------------------------------------


  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();