/**
 * @interface Response
 * Define la estructura estándar para las respuestas de la API.
 * Siempre incluye un booleano de éxito y permite opcionalmente un mensaje
 * y un objeto de datos genérico (T).
 */
export interface Response<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ResponseWithPagination<T = unknown> {
  success: boolean;
  pagination: PaginationInfo;
  data?: T;
}

// Tipos derivados para modularidad y reutilización
export type MinimalUser = Pick<User, "id" | "name" | "slug" | "avatar_url">;
export type MinimalCommunity = Pick<Community, "slug" | "image_url" | "name">;

/**
 * @interface PaginationInfo
 * Contiene metadatos para la paginación de listas largas.
 */
export interface PaginationInfo {
  page: number; // Página actual.
  limit: number; // Límite de ítems por página.
  hasMore: boolean;
  total: number; // Total de ítems disponibles (en toda la colección).
  totalPages: number; // Total de páginas.
  hasNext: boolean; // Indica si hay una página siguiente.
  hasPrev: boolean; // Indica si hay una página anterior.
}

/**
 * @interface User
 * Representa la información completa de un usuario autenticado.
 * NOTA: El 'id' está definido como 'string', lo que es común para CUIDs/UUIDs.
 */
export interface User {
  id: string;
  name: string;
  slug: string;
  email: string;
  role: string;
  provider: string;
  isBusiness: boolean;
  active: boolean;
  subscription_status: string;
  trial_ends_at: string;
  avatar_url: string | null; // URL de la imagen de perfil.
}

/**
 * @interface CategoryTag
 * Representa una categoría general (ej. 'Comida Rápida', 'Vegetariano').
 */
export interface CategoryTag {
  id: number;
  name: string;
  description?: string | null;
  icon_url?: string;
}

/**
 * @interface CommunityTag
 * Representa una etiqueta asignada a una comunidad, relacionada con una CategoryTag.
 */
export interface CommunityTag {
  id: number;
  active: boolean;
  category_id: number;
  name: string;
  category: CategoryTag; // Objeto de la categoría relacionada.
}

/**
 * @interface Community
 * Representa la información detallada de una comunidad o grupo.
 */
export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  theme_color: string | null;
  visibility: string | null;
  creator_id: string;
  total_members: number;
  tags: CommunityTag[];
  isMember: boolean;
  receives_notifications: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * @interface Ingredient
 * Representa un ingrediente básico en la base de datos.
 */
export interface Ingredient {
  id: number;
  name: string;
  description: string | null;
}

/**
 * @interface UnitOfMeasure
 * Representa una unidad de medida para los ingredientes (ej. 'gramos', 'ml').
 */
export interface UnitOfMeasure {
  id: number;
  name: string;
  abbreviation: string | null;
}

/**
 * @interface RecipeIngredient
 * Define la relación entre una receta y un ingrediente (línea de la receta).
 */
export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  quantity: string; 
  unit_of_measure_id: number;
  notes: string;
  ingredient?: Ingredient;
  unit_of_measure?: UnitOfMeasure;
}

/**
 * @interface RecipeStep
 * Define un paso individual dentro de la preparación de una receta.
 */
export interface RecipeStep {
  id: number;
  recipe_id: number;
  step_number: number;
  description: string;
  image_url: string | null;
  estimated_time: number; 
}

/**
 * @interface Recipe
 * La estructura principal de una receta.
 */
export interface Recipe {
  id: string; // Identificador único de la receta.
  user: MinimalUser;
  slug: string;
  name: string;
  description: string;
  total_time: number;
  main_image: string;
  created_at: string;
  updated_at: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  posts: Posts[]; 
}

/**
 * @interface Posts
 * Representa una publicación dentro de una comunidad.
 */
export interface Posts {
  id: string;
  user_id: string;
  community_id: string;
  title: string;
  content: string;
  image_urls: string[];
  type: "post" | "recipe";
  slug: string;
  recipe_id: string | null;
  votes_up: number;
  votes_down: number;
  total_comments: number;
  created_at: string;
  updated_at: string;
  edited: boolean;
  active: boolean;
  user: MinimalUser;
  recipe: {
    id: string;
    name: string;
    slug: string;
    main_image: string | null;
    total_time: number | null;
    _count: {
      steps: number;
      ingredients: number;
    };
  };
  community: MinimalCommunity;
  userVote: string | null;
  hasVoted: boolean | null;
}

export interface PostFull {
  id: string;
  slug: string;
  title: string;
  content: string;
  image_urls: string[];
  type: "post" | "recipe";
  votes_up: number;
  votes_down: number;
  total_comments: number;
  created_at: string;
  updated_at: string;
  edited: boolean;
  active: boolean;
  user_id: string;
  community_id: string;
  recipe_id: string | null;
  userVote: "up" | "down" | null;
  hasVoted: boolean | null;

  user: {
    id: string;
    slug: string;
    name: string;
    email: string;
    avatar_url: string;
    role: "user" | "admin";
    active: boolean;
    provider: string;
    is_business: boolean;
    subscription_status: "active" | "inactive";
    trial_ends_at: string | null;
    created_at: string;
    updated_at: string;
  };

  community: {
    id: string;
    slug: string;
    name: string;
    description: string;
    image_url: string;
    theme_color: string;
    visibility: "public" | "private";
    total_members: number;
    creator_id: string;
    created_at: string;
    updated_at: string;
    active: boolean;
  };

  recipe: Recipe | null;

  comments: Comment[];
}

/**
 * @interface Comment
 * Representa un comentario dentro de una publicación.
 */

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  parent_comment_id: string | null;
  content: string;
  votes_up: number;
  votes_down: number;
  created_at: string;
  updated_at: string;
  edited: boolean;
  active: boolean;
  user: {
    id: string;
    name: string;
    slug: string;
    avatar_url: string | null;
  };
  userVote: string | null;
  replies: Comment[];
}

/**
 * @interface Notification
 * Representa una notificación de usuario.
 * */
export interface Notification {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  metadata: NotificationMetadata;
  created_at: string;
  read: boolean;
  message: string;
}

/**
 * @interface NotificationMetadata
 * Define la estructura de los metadatos de una notificación.
 */
export interface NotificationMetadata {
  title: string;
  message: string;
  type: "post" | "comment";
  imageURLs: {
    user?: string;
    community?: string;
    post?: string;
  };
  slugs: {
    community?: string;
    user?: string;
    post?: string;
  };
  //imageURLs: string[]; // 1ro usuario, 2do comunidad
  //slugs: string[]; // 1ro comunidad, 2do usuario del post, 3ro post
}

export interface ChatMetadata {
  chatId: string;
  title: string;
  activeRecipeId?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface ChatSessionData {
  text: string;
  role: "USER" | "IA";
}

export interface CHATData {
  chatId?: string;
  title?: string;
  messages: ChatSessionData[];
  createdAt?: string;
  lastUpdated?: string;
  activeRecipeId?: string;
}



