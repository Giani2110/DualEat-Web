import { PrismaClient, TypesCategory } from '@prisma/client';

const prisma = new PrismaClient();

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
      "Cocina express"
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
      "Detox"
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
      "Día del padre"
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
      "Molecular"
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
      "Superfoods"
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
      "Máximo rendimiento"
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
      "Picnic perfecto"
    ],
  }
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
  },

  // ESTILOS O DIETAS
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
  },

  // ORIGEN Y CULTURA
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
  }
];

async function main() {
  // Seed FoodCategory
  for (const category of foodCategories) {
    const existingCategory = await prisma.foodCategory.findFirst({
      where: { name: category.name }
    });

    if (!existingCategory) {
      await prisma.foodCategory.create({
        data: category,
      });
      console.log(`✅ Created FoodCategory: ${category.name}`);
    } else {
      console.log(`⏭️  FoodCategory already exists: ${category.name}`);
    }
  }
  console.log('Seed de FoodCategory completado ✅');

  // Seed TagCategory + CommunityTag
  for (const item of tagData) {
    let category = await prisma.tagCategory.findFirst({
      where: { name: item.category.name }
    });

    if (!category) {
      category = await prisma.tagCategory.create({
        data: item.category,
      });
      console.log(`✅ Created TagCategory: ${item.category.name}`);
    } else {
      console.log(`⏭️  TagCategory already exists: ${item.category.name}`);
    }

    for (const tagName of item.tags) {
      const existingTag = await prisma.communityTag.findUnique({
        where: { name: tagName }
      });

      if (!existingTag) {
        await prisma.communityTag.create({
          data: {
            name: tagName,
            category_id: category.id,
            active: true,
          },
        });
        console.log(`✅ Created CommunityTag: ${tagName}`);
      } else {
        console.log(`⏭️  CommunityTag already exists: ${tagName}`);
      }
    }
  }
  console.log('Seed de TagCategory y CommunityTag completado ✅');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });