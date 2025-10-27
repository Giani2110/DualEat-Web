// --- Módulos Principales de Autenticación y Locales ---
export { default as Auth } from "./modules/auth/routes/auth.routes";
export { default as Contact } from "./modules/mail/routes/contact.routes";

export { default as Review } from "./modules/Locals/route/review.routes";
export { default as Critique } from "./modules/Locals/route/critique.routes";
export { default as Statistics } from "./modules/Locals/route/statistics.routes";
export { default as Orders } from "./modules/Locals/route/order.routes";
export { default as ManualLoadMenu } from "./modules/Locals/route/manualLoadMenu.routes";
export { default as QR } from "./modules/Locals/route/qr.routes";
export { default as Food } from "./modules/Locals/route/food.routes";
export { default as LocalMenuCategory } from "./modules/Locals/route/foodCategory.routes";
export { default as LocalSettings } from "./modules/Locals/route/settings.routes";
export { default as LocalCalendar } from "./modules/Locals/route/calendar.routes";

// --- Módulos de Comunidad ---
export { default as Community } from "./modules/community/routes/community.routes";
export { default as CommunityTags } from "./modules/community/routes/community-tag.routes";
export { default as TagCategory } from "./modules/community/routes/tag-category.routes";

// --- Módulos de Contenido (Recetas y Posts) ---
export { default as Recipe } from "./modules/recipe/recipe.routes";
export { default as Post } from "./modules/post/post.routes";
export { default as Chat } from "./modules/chat/routes/chat.routes";

// --- Módulos de Utilidad y Misceláneos ---
export { default as Notification } from "./modules/notification/routes/notification.routes";
export { default as Vote } from "./modules/votes/vote.routes";
export { default as Onboarding} from "./routes/onBoarding.routes";
export { default as Admin } from "./routes/admin.routes";
export { default as OCR } from "./routes/ocr.routes";
export { default as Users } from "./routes/users";