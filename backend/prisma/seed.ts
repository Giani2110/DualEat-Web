// Seed.ts completo
import {
  PrismaClient,
  TypesCategory,
  Role,
  SubscriptionStatus,
  LocalUserRole,
  PostType,
  Visibility,
  VoteType,
  OrderStatus,
  SubscriptionPlan,
  SubscriptionStateMP,
  ContentType,
} from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// Ruta al archivo de ingredientes
const ingredientsFilePath = join(__dirname, "../..", "ingredientes.txt");

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
];
// DATOS PARA COMUNIDADES Y PREFERENCIAS DE USUARIOS
const tagData = [
  {
    category: {
      name: "Recetas y cocina",
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
  {
    category: {
      name: "Técnicas culinarias",
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

// CATEGORÍAS GLOBALES DE COMIDA PARA CLASIFICAR PRODUCTOS
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
    ); // ---- 2. Siembra de la tabla Ingredient ----

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
    ); // ---- 3. Siembra de FoodCategory ----

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
    console.log("Seed de FoodCategory completado ✅"); // ---- 4. Siembra de TagCategory + CommunityTag ----

    for (const item of tagData) {
      let category = await prisma.tagCategory.findFirst({
        where: { name: item.category.name },
      });

      if (!category) {
        category = await prisma.tagCategory.create({
          data: item.category,
        });
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

    // ---- 5. SEED DE USUARIOS ----
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
        if (!existingUser) {
          return prisma.user.create({ data: user });
        }
        return existingUser;
      })
    );
    console.log(
      `✅ ${users.length} usuarios han sido insertados o ya existen.`
    );

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

    // ---- 7. SEED DE LOCALES ----
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
        if (!existingLocal) {
          return prisma.local.create({ data: local });
        }
        return existingLocal;
      })
    );
    console.log(
      `✅ ${locals.length} locales han sido insertados o ya existen.`
    );

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

    // ---- 9. SEED DE FOODS ----
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
        if (!existingFood) {
          return prisma.food.create({ data: food });
        }
        return existingFood;
      })
    );
    console.log(
      `✅ ${foods.length} alimentos han sido insertados o ya existen.`
    );

    // ---- 10. SEED DE RECIPES ----
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
        if (!existingRecipe) {
          return prisma.recipe.create({ data: recipe });
        }
        return existingRecipe;
      })
    );
    console.log(
      `✅ ${recipes.length} recetas han sido insertadas o ya existen.`
    );

    // ---- 11. SEED DE RECIPEINGREDIENT ----
    const recipeIngredientsData = [
      {
        recipe_id: recipes[0].id,
        ingredient_id: 1,
        quantity: "500",
        unit_of_measure_id: 1,
      },
      {
        recipe_id: recipes[0].id,
        ingredient_id: 2,
        quantity: "200",
        unit_of_measure_id: 2,
      },
      {
        recipe_id: recipes[1].id,
        ingredient_id: 3,
        quantity: "2",
        unit_of_measure_id: 8,
      },
      {
        recipe_id: recipes[2].id,
        ingredient_id: 4,
        quantity: "100",
        unit_of_measure_id: 1,
      },
      {
        recipe_id: recipes[3].id,
        ingredient_id: 5,
        quantity: "500",
        unit_of_measure_id: 1,
      },
    ];
    await prisma.recipeIngredient.createMany({
      data: recipeIngredientsData,
      skipDuplicates: true,
    });
    console.log(
      `✅ ${recipeIngredientsData.length} ingredientes de receta han sido insertados.`
    );

    // ---- 12. SEED DE RECIPESTEP ----
    const recipeStepsData = [
      {
        recipe_id: recipes[0].id,
        step_number: 1,
        description: "Cocer el pollo y desmenuzarlo.",
        estimated_time: 15,
      },
      {
        recipe_id: recipes[1].id,
        step_number: 1,
        description: "Triturar el aguacate.",
        estimated_time: 5,
      },
      {
        recipe_id: recipes[2].id,
        step_number: 1,
        description: "Derretir el chocolate.",
        estimated_time: 10,
      },
      {
        recipe_id: recipes[3].id,
        step_number: 1,
        description: "Mezclar la carne picada con especias.",
        estimated_time: 5,
      },
      {
        recipe_id: recipes[4].id,
        step_number: 1,
        description: "Cocer la pasta al dente.",
        estimated_time: 12,
      },
    ];
    await prisma.recipeStep.createMany({
      data: recipeStepsData,
      skipDuplicates: true,
    });
    console.log(
      `✅ ${recipeStepsData.length} pasos de receta han sido insertados.`
    );

    // ---- 13. SEED DE COMMUNITIES ----
    // ---- 13. SEED DE COMMUNITIES ----
    const communitiesData = [
      {
        name: "Comunidad de Veganos",
        description: "Para todos los que aman la cocina vegana.",
        image_url: "url_comunidad_vegana",
        theme_color: "#4CAF50",
        visibility: Visibility.public,
        creatorEmail: "maria.lopez@example.com",
        tagIds: [1, 2], // IDs existentes de CommunityTag
      },
      {
        name: "Amantes del Asado",
        description: "Recetas y tips para la parrilla.",
        image_url: "url_comunidad_asado",
        theme_color: "#FF5722",
        visibility: Visibility.public,
        creatorEmail: "carlos.gomez@example.com",
        tagIds: [3, 4],
      },
      {
        name: "Keto-Fans",
        description: "Compartiendo recetas bajas en carbohidratos.",
        image_url: "url_comunidad_keto",
        theme_color: "#9C27B0",
        visibility: Visibility.public,
        creatorEmail: "juan.perez@example.com",
        tagIds: [5, 6],
      },
      {
        name: "Postres para principiantes",
        description: "El lugar para los que se inician en la repostería.",
        image_url: "url_comunidad_postres",
        theme_color: "#FFCDD2",
        visibility: Visibility.public,
        creatorEmail: "laura.rodriguez@example.com",
        tagIds: [7, 8],
      },
      {
        name: "Cocina Económica",
        description: "Recetas ricas y baratas para todos.",
        image_url: "url_comunidad_economica",
        theme_color: "#4CAF50",
        visibility: Visibility.public,
        creatorEmail: "pedro.martinez@example.com",
        tagIds: [9, 10],
      },
    ];

    const communities: any[] = [];

    for (const community of communitiesData) {
      // Buscar al creador
      const creator = await prisma.user.findUnique({
        where: { email: community.creatorEmail },
      });
      if (!creator)
        throw new Error(
          `No se encontró el usuario con email ${community.creatorEmail}`
        );

      // Verificar si la comunidad ya existe
      const existingCommunity = await prisma.community.findFirst({
        where: { name: community.name },
      });

      if (!existingCommunity) {
        // Crear comunidad primero sin tags
        const newCommunity = await prisma.community.create({
          data: {
            name: community.name,
            description: community.description,
            image_url: community.image_url,
            theme_color: community.theme_color,
            visibility: community.visibility,
            creator_id: creator.id,
          },
        });

        // Conectar tags después
        if (community.tagIds && community.tagIds.length > 0) {
          await prisma.community.update({
            where: { id: newCommunity.id },
            data: {
              tags: {
                connect: community.tagIds.map((id) => ({ id })),
              },
            },
          });
        }

        communities.push(newCommunity);
        console.log(`✅ Comunidad creada: ${community.name}`);
      } else {
        communities.push(existingCommunity);
        console.log(`ℹ️ Comunidad ya existe: ${community.name}`);
      }
    }

    // ---- 14. SEED DE COMMUNITYMEMBER ----
    const communityMembersData = [
      {
        user_id: users[0].id,
        community_id: communities[1].id,
        is_moderator: true,
      },
      {
        user_id: users[1].id,
        community_id: communities[0].id,
        is_moderator: true,
      },
      { user_id: users[2].id, community_id: communities[2].id },
      { user_id: users[3].id, community_id: communities[3].id },
      { user_id: users[4].id, community_id: communities[4].id },
    ];

    await prisma.communityMember.createMany({
      data: communityMembersData,
      skipDuplicates: true,
    });
    console.log(
      `✅ ${communityMembersData.length} miembros de comunidad han sido insertados.`
    );

    // ---- 15. SEED DE POSTS ----
    const postsData = [
      {
        user_id: users[1].id,
        community_id: communities[0].id,
        title: "Mi receta de lentejas veganas!",
        content: "Una receta simple y rica para todos.",
        type: PostType.recipe,
        image_urls: ["url_lentejas"],
      },
      {
        user_id: users[0].id,
        community_id: communities[1].id,
        title: "Tips para el mejor asado",
        content: "Consejos para que la carne quede perfecta.",
        type: PostType.post,
        image_urls: ["url_tips_asado"],
      },
      {
        user_id: users[2].id,
        community_id: communities[2].id,
        title: "Tarta de calabaza keto",
        content: "Receta para una tarta baja en carbohidratos.",
        type: PostType.recipe,
        image_urls: ["url_tarta_keto"],
      },
      {
        user_id: users[3].id,
        community_id: communities[3].id,
        title: "Mis primeros muffins!",
        content: "Estoy orgulloso de mi primer intento.",
        type: PostType.post,
        image_urls: ["url_muffins"],
      },
      {
        user_id: users[4].id,
        community_id: communities[4].id,
        title: "Cena por menos de $1000",
        content: "Un plato super rendidor.",
        type: PostType.post,
        image_urls: ["url_cena_barata"],
      },
    ];

    const posts = await Promise.all(
      postsData.map(async (post) => {
        const existingPost = await prisma.post.findFirst({
          where: {
            title: post.title,
            user_id: post.user_id,
            community_id: post.community_id,
          },
        });
        if (!existingPost) {
          return prisma.post.create({ data: post });
        }
        return existingPost;
      })
    );
    console.log(`✅ ${posts.length} posts han sido insertados o ya existen.`);

    // ---- 16. SEED DE POSTCOMMENTS ----
    const postCommentsData = [
      {
        user_id: users[2].id,
        post_id: posts[0].id,
        content: "Se ve deliciosa! La voy a probar.",
      },
      {
        user_id: users[3].id,
        post_id: posts[0].id,
        content: "Excelente idea, muy nutritiva.",
      },
      {
        user_id: users[4].id,
        post_id: posts[1].id,
        content: "Gracias por los tips! Me sirvieron mucho.",
      },
      {
        user_id: users[0].id,
        post_id: posts[2].id,
        content: "Increíble, me encanta!",
      },
      {
        user_id: users[1].id,
        post_id: posts[3].id,
        content: "Te quedaron hermosos, felicitaciones!",
      },
    ];

    const postComments = await Promise.all(
      postCommentsData.map(async (comment) => {
        const existingComment = await prisma.postComment.findFirst({
          where: { user_id: comment.user_id, post_id: comment.post_id },
        });
        if (!existingComment) {
          return prisma.postComment.create({ data: comment });
        }
        return existingComment;
      })
    );
    console.log(`✅ ${postComments.length} comentarios han sido insertados.`);

    // ---- 17. SEED DE LOCALREVIEW ----
    const localReviewsData = [
      {
        user_id: users[0].id,
        local_id: locals[0].id,
        rating: 5,
        comment: "Excelente atencion y la carne perfecta.",
      },
      {
        user_id: users[1].id,
        local_id: locals[1].id,
        rating: 4,
        comment: "Buena pizza, el lugar es un poco chico.",
      },
      {
        user_id: users[2].id,
        local_id: locals[2].id,
        rating: 5,
        comment: "El mejor sushi de la ciudad, fresco y sabroso.",
      },
      {
        user_id: users[3].id,
        local_id: locals[3].id,
        rating: 3,
        comment: "Buen cafe, pero tardaron mucho en atender.",
      },
      {
        user_id: users[4].id,
        local_id: locals[4].id,
        rating: 5,
        comment: "Helados unicos! sabores muy creativos.",
      },
    ];
    await prisma.localReview.createMany({
      data: localReviewsData,
      skipDuplicates: true,
    });
    console.log(`✅ ${localReviewsData.length} reviews han sido insertados.`);

    // ---- 18. SEED DE ORDERS ----
    const ordersData = [
      {
        user_id: users[0].id,
        local_id: locals[0].id,
        total: 11500.0,
        status: OrderStatus.confirmed,
      },
      {
        user_id: users[1].id,
        local_id: locals[1].id,
        total: 3800.0,
        status: OrderStatus.preparing,
      },
      {
        user_id: users[2].id,
        local_id: locals[2].id,
        total: 9000.0,
        status: OrderStatus.pending,
      },
      {
        user_id: users[3].id,
        local_id: locals[3].id,
        total: 1500.0,
        status: OrderStatus.ready,
      },
      {
        user_id: users[4].id,
        local_id: locals[4].id,
        total: 2500.0,
        status: OrderStatus.delivered,
      },
    ];

    const orders = await Promise.all(
      ordersData.map(async (order) => {
        const existingOrder = await prisma.order.findFirst({
          where: {
            user_id: order.user_id,
            local_id: order.local_id,
            total: order.total,
          },
        });
        if (!existingOrder) {
          return prisma.order.create({ data: order });
        }
        return existingOrder;
      })
    );
    console.log(
      `✅ ${orders.length} pedidos han sido insertados o ya existen.`
    );

    // ---- 19. SEED DE ORDERITEMS ----
    const orderItemsData = [
      {
        order_id: orders[0].id,
        food_id: foods[0].id,
        quantity: 1,
        unit_price: 5500,
        subtotal: 5500,
      },
      {
        order_id: orders[0].id,
        food_id: foods[1].id,
        quantity: 1,
        unit_price: 6000,
        subtotal: 6000,
      },
      {
        order_id: orders[1].id,
        food_id: foods[3].id,
        quantity: 1,
        unit_price: 3800,
        subtotal: 3800,
      },
      {
        order_id: orders[2].id,
        food_id: foods[4].id,
        quantity: 2,
        unit_price: 4500,
        subtotal: 9000,
      },
      {
        order_id: orders[3].id,
        food_id: foods[2].id,
        quantity: 1,
        unit_price: 1500,
        subtotal: 1500,
      },
    ];
    await prisma.orderItem.createMany({
      data: orderItemsData,
      skipDuplicates: true,
    });
    console.log(
      `✅ ${orderItemsData.length} items de pedido han sido insertados.`
    );

    // ---- 20. SEED DE VOTES ----
    const votesData = [
      {
        user_id: users[0].id,
        content_type: ContentType.food,
        content_id: foods[1].id,
        vote_type: VoteType.up,
      },
      {
        user_id: users[1].id,
        content_type: ContentType.food,
        content_id: foods[4].id,
        vote_type: VoteType.up,
      },
      {
        user_id: users[2].id,
        content_type: ContentType.post,
        content_id: posts[1].id,
        vote_type: VoteType.up,
      },
      {
        user_id: users[3].id,
        content_type: ContentType.comment,
        content_id: postComments[1].id,
        vote_type: VoteType.up,
      },
      {
        user_id: users[4].id,
        content_type: ContentType.food,
        content_id: foods[3].id,
        vote_type: VoteType.down,
      },
    ];
    await Promise.all(
      votesData.map(async (vote) => {
        try {
          const existingVote = await prisma.vote.findFirst({
            where: {
              user_id: vote.user_id,
              content_id: vote.content_id,
              content_type: vote.content_type,
            },
          });
          if (!existingVote) {
            return await prisma.vote.create({
              data: {
                user_id: vote.user_id,
                content_id: vote.content_id,
                content_type: vote.content_type,
                vote_type: vote.vote_type,
              },
            });
          }
          return existingVote;
        } catch (e) {
          console.error(
            `Error al insertar voto para el usuario ${vote.user_id} y contenido ${vote.content_id}:`,
            e
          );
          return null;
        }
      })
    );
    console.log(`✅ ${votesData.length} votos han sido procesados.`);

    // ---- 21. SEED DE SUBSCRIPTIONS ----
    const subscriptionsData = [
      {
        user_id: users[0].id,
        mp_preapproval_id: "mp_preapproval_1",
        plan: SubscriptionPlan.business,
        amount: 2000.0,
        start_date: new Date(),
        status: SubscriptionStateMP.authorized,
      },
      {
        user_id: users[1].id,
        mp_preapproval_id: "mp_preapproval_2",
        plan: SubscriptionPlan.user_premium,
        amount: 999.0,
        start_date: new Date(),
        status: SubscriptionStateMP.authorized,
      },
      {
        user_id: users[2].id,
        mp_preapproval_id: "mp_preapproval_3",
        plan: SubscriptionPlan.user_premium,
        amount: 999.0,
        start_date: new Date(),
        status: SubscriptionStateMP.paused,
      },
      {
        user_id: users[3].id,
        mp_preapproval_id: "mp_preapproval_4",
        plan: SubscriptionPlan.business,
        amount: 2000.0,
        start_date: new Date(),
        status: SubscriptionStateMP.authorized,
      },
      {
        user_id: users[4].id,
        mp_preapproval_id: "mp_preapproval_5",
        plan: SubscriptionPlan.user_premium,
        amount: 999.0,
        start_date: new Date(),
        status: SubscriptionStateMP.finished,
      },
    ];
    await prisma.subscription.createMany({
      data: subscriptionsData,
      skipDuplicates: true,
    });
    console.log(
      `✅ ${subscriptionsData.length} suscripciones han sido insertadas.`
    );
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
