type Role = "USER" | "ADMIN";

type SuscriptionStatus = "ACTIVE" | "INACTIVE" | "TRIAL" | "CANCELED";

export interface Response<T = unknown> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  status: number;
  message: string;
  token?: string;
  user?: User;
}

export interface ResponseWithPagination<T = unknown> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
}

export interface ChatSessionResponse {
  chat: ChatSession;
  recipes: Recipe[] | null;
  search_query: "SEARCH" | "CHAT";
}

export interface UploadResponse {
  post_images: string[];
  main_image: string;
  step_images: string[];
}

interface PaginationInfo {
  page: number;
  hasMore: boolean;
}

export interface User {
  id: string;
  slug: string;
  name: string;
  email: string;
  avatar_url:
    | string
    | "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png";
  role: Role;
  active: boolean;
  verified: boolean;
  provider: string;
  is_business: boolean;
  subscription_status: SuscriptionStatus;
  trial_ends_at: Date | null;
  notificationsPref: NotificationFrequency;
  workplaces: Workplace[];

  preferences: UserPreference[];

  created_at: Date;
  updated_at: Date;
}

export interface UserPreference {
  id: number;
  user_id: string;
  user: User;

  food_category_id: string | null;
  community_tag_id: string | null;

  foodCategory: FoodCategory | null;
  communityTag: CommunityTag | null;
}

export interface Workplace {
  id: string;
  name: string;
  slug: string;
  role: "admin" | "staff";
}

interface Metadata {
  params?: {
    slug?: string;
    parent_slug?: string;
    id?: string;
    parent_id?: string;
  };
  message?: string;

  image_urls?: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  content_type: NotificationContentType;
  content_id?: string;

  title: string;
  message: string;
  metadata?: Metadata | any;
  read: boolean;
  deleted: boolean;
  created_at: string;

  user: User;
}

export interface Local {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  type_local: string; // Hacer type
  address: string;
  image_url: string;
  latitude: number;
  longitude: number;
  average_rating: number;

  promotions?: Promotion[];
  schedules?: Schedules[];
  categories?: FoodCategory[];

  _count?: { reviews?: number; orders?: number; foods?: number };
}

export interface LocalReview {
  id: string;
  user: User;
  user_id: string;
  local: Local;
  local_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
  updated_at: Date;

  order?: Order;
  order_id?: string;

  total?: number;
}

export interface Food {
  id: string;
  local_id: string;
  local: Local;
  category_id: string;
  category: FoodCategory;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  available: boolean;
  votes_up: number;
  votes_down: number;
  created_at?: Date;
  updated_at?: Date;
  promotions?: Promotion;
  order_items: OrderItem[];
}

export interface Promotion {
  id: string;
  description: string | null;
  discount_pct: number | null;
  local_id: string;
  food_id: string | null;
  title: string;
  starts_at: Date | null;
  ends_at: Date | null;
  active: boolean;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "COMPLETED"
  | "CANCELLED"
  | "READY";

export interface Order {
  id: string;
  user: User;
  user_id: string;
  local: Local;
  local_id: string;
  total: number;
  status: OrderStatus;
  payment_method?: string;
  created_at: Date;
  updated_at: Date;

  short_code?: string;
  delivery_date?: Date;
  notes?: string | null;

  order_items: OrderItem[];
  review?: LocalReview;

  _count?: { order_items?: number };
}

export interface OrderItem {
  id: string;
  order: Order;
  order_id: string;
  food: Food;
  food_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Schedules {
  id: string;
  day_of_week: DayOfWeek;
  open_time: string;
  close_time: string;
  local_id: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  tipo: string;
  icon_url: string | null;

  foods?: Food[];
}

export interface CommunityTag {
  id: string;
  name: string;
  active: boolean;

  category: TagCategory;
  communities: Community[];
}

export interface TagCategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon_url?: string;

  communityTags: CommunityTag[];
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | "https://placehold.co/100x100";
  banner_url:
    | string
    | "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultBanner.jpg";

  total_members: number;

  creator: User;
  creator_id: string;

  created_at: Date;
  updated_at: Date;
  active: boolean;

  posts: Post[];
  members: CommunityMember[];

  tags: CommunityTag[];

  isMember?: boolean;
  is_moderator?: boolean;
  receives_notifications?: NotificationFrequency;
}

export interface CommunityMember {
  id: string;
  user: User;
  user_id: string;
  community: Community;
  community_id: string;

  receives_notifications: NotificationFrequency;
  is_moderator: boolean;

  joined_at: Date;
  updated_at: Date;
}

export type NotificationFrequency = "ALWAYS" | "NONE";

export type NotificationContentType =
  | "POST"
  | "COMMENT"
  | "LOCAL"
  | "ORDER"
  | "COMMUNITY";

export type ContentType = "POST" | "COMMENT";

export type VoteType = "UP" | "DOWN";

export interface Vote {
  id: number;
  user: User;
  user_id: string;
  content_type: ContentType;
  content_id: string;

  vote_type: VoteType;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: string;
  slug: string;

  user: User;
  user_id: string;

  community: Community;
  community_id: string;

  title: string;
  content: string;
  image_urls: string[];

  votes_up: number;
  votes_down: number;
  total_comments: number;

  created_at: Date;
  updated_at: Date;
  edited: boolean;
  active: boolean;

  comments: PostComment[];
  recipe: Recipe | null;
  recipe_id: string | null;

  user_vote?: VoteType | null;
  has_voted?: boolean;

  _count?: { comments?: number };
}

export interface PostComment {
  id: string;
  user: User;
  user_id: string;

  post: Post;
  post_id: string;
  parent_comment: PostComment | null;
  parent_comment_id: string | null;

  reply_to_user: User | null;
  reply_to_user_id: string | null;

  content: string;

  votes_up: number;
  votes_down: number;
  total_comments: number;

  created_at: Date;
  updated_at: Date;
  active: boolean;

  user_vote?: VoteType | null;
  has_voted?: boolean;

  replies: PostComment[];

  _count?: { replies?: number };
}

export interface Recipe {
  id: string;
  slug: string;
  user: User;
  user_id: string;

  name: string;
  description: string;
  total_time: number | null;
  main_image: string | "https://placehold.co/400x400";

  created_at: Date;
  updated_at: Date;

  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  posts: Post[];

  votes_up?: number;
  votes_down?: number;

  _count?: { ingredients?: number; steps?: number };
}

export interface RecipeStep {
  id: string;
  recipe: Recipe;
  recipe_id: string;
  step_number: number;
  description: string;
  estimated_time: number | null;
}

export interface RecipeIngredient {
  id: string;
  recipe: Recipe;
  recipe_id: string;

  ingredient: Ingredient;
  ingredient_id: number;

  quantity: string;
  unit: Unit;
  notes: string | null;
}

export interface Ingredient {
  id: number;
  name: string;
  description: string | null;

  calories: number;
  proteins: number;
  carbs: number;
  fat: number;

  recipe_ingredients: RecipeIngredient[];
}

export enum Unit {
  GRAMOS = "GRAMOS",
  KILOGRAMOS = "KILOGRAMOS",
  MILILITROS = "MILILITROS",
  LITROS = "LITROS",
  CUCHARADITA = "CUCHARADITA",
  CUCHARADA = "CUCHARADA",
  TAZA = "TAZA",
  UNIDAD = "UNIDAD",
  PIZCA = "PIZCA",
  PAQUETE = "PAQUETE",
  OPCIONAL = "OPCIONAL",
}

export const UnitList: Unit[] = [
  Unit.GRAMOS,
  Unit.KILOGRAMOS,
  Unit.MILILITROS,
  Unit.LITROS,
  Unit.CUCHARADITA,
  Unit.CUCHARADA,
  Unit.TAZA,
  Unit.UNIDAD,
  Unit.PIZCA,
  Unit.PAQUETE,
  Unit.OPCIONAL,
];

export const UnitNames: Record<Unit, { abbreviation: string; name: string }> = {
  [Unit.GRAMOS]: {
    abbreviation: "gr",
    name: "gramos",
  },
  [Unit.KILOGRAMOS]: {
    abbreviation: "kg",
    name: "kilogramos",
  },
  [Unit.MILILITROS]: {
    abbreviation: "ml",
    name: "mililitros",
  },
  [Unit.LITROS]: {
    abbreviation: "l",
    name: "litros",
  },
  [Unit.CUCHARADITA]: {
    abbreviation: "cdta",
    name: "cucharaditas",
  },
  [Unit.CUCHARADA]: {
    abbreviation: "cda",
    name: "cucharadas",
  },
  [Unit.TAZA]: {
    abbreviation: "tza",
    name: "tazas",
  },
  [Unit.UNIDAD]: {
    abbreviation: "ud",
    name: "unidades",
  },
  [Unit.PIZCA]: {
    abbreviation: "pizca",
    name: "pizcas",
  },
  [Unit.PAQUETE]: {
    abbreviation: "paq",
    name: "paquetes",
  },
  [Unit.OPCIONAL]: {
    abbreviation: "opc",
    name: "opcional",
  },
};

export interface NutritionData {
  total_ingredients: number;
  avg_calories: number;
  avg_proteins: number;
  avg_carbs: number;
  avg_fat: number;
  total: number;
}

export type DayOfWeek =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

export type QRTypes = {
  LOCAL: "local";
  ORDER: "order";
  PROMOTION: "promotion"; // Coupon
  USER: "user";
};

export type QROrderItem = {
  id: string; // food_id
  q: number; // quantity
};

export type QROrderPayload = {
  t: "order";
  oi: string | "create"; // order_id
  l: string; // local_id
  u: string; // user_id
  i: QROrderItem[]; // items del carrito
  c?: string; // Código de acceso
};

export type QRUserPayload = {
  t: "user";
  s: string; // slug
};

export type QRLocalPayload = {
  t: "local";
  s: string; // Slug
};

export type QRData = QROrderPayload | QRUserPayload | QRLocalPayload;

export interface ChatSession {
  chat_id: string;
  title: string;
  createdAt: string;
  lastActivity: string;
  messages: ChatSessionData[];
  recipe_id?: string;
}

export interface ChatSessionData {
  text: string;
  role: "USER" | "IA";
}
