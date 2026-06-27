import {
  Login,
  Register,
  RegisterLocal,
  Onboarding,
  ResetPassword,
  LandingHome,
  AboutUs,
  LandingBusiness,
  ChangeLog,
  TermsConditions,
  ProtectedRoute,
  PublicRoute,
  UDashboard,
  AdminBusinessCreation,
  AdminFoodCategories,
  AdminLocals,
  AdminDashboard,
  AdminUsers,
  LocalDashboard,
  LocalMenu,
  LocalQR,
  LocalReviews,
  LocalSettings,
  LocalCalendar,
  LocalEmployees,
  LocalSubscription,
  UExplore,
  Chat,
  CommunityDetail,
  PostDetail,
  Notifications,
  RecipeDetail,
  CreateRecipe,
  CreatePost,
  Profile,
} from "../../pages";

import { AdminSupportTickets } from "@/pages/private/admin/SupportTickets";

import AdminLayout from "@/layout/admin/AdminLayout";

// 1. RUTAS
// =========================================================
export const ROUTES = {
  PUBLIC: {
    HOME: "/",
    ABOUT_US: "/about-us",
    BUSINESS: "/business",
    CHANGELOG: "/changelog",
    TERMS: "/terms",
  },
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/signup",
    REGISTER_LOCAL: "/signup/locals",
    ONBOARDING: "/onboarding",
    RESET_PASSWORD: "/password_recovery",
  },
  USER: {
    DASHBOARD: "/feed",
    CREATE_POST: "/create_post",
    CREATE_RECIPE: "/create_recipe",

    RECIPE_PATH: "/r/:recipe_id/:recipe_slug",

    RECIPE: (recipe_id: string, recipe_slug: string) =>
      `/r/${recipe_id}/${recipe_slug}`,

    POST: (post_id: string, post_slug: string) => `/p/${post_id}/${post_slug}`,

    COMMUNITY: (community_slug: string) => `/c/${community_slug}`,

    EXPLORE: (category_id?: string, category_slug?: string) => {
      if (!category_id || !category_slug) return "/explore";
      return `/explore/${category_id}/${category_slug}`;
    },

    CHAT: `/chat/`,

    PROFILE: (user_id: string, user_slug: string) =>
      `/profile/${user_id}/${user_slug}`,

    NOTIFICATIONS: "/notifications",
  },
  ADMIN: {
    BUSINESS_CREATION: "/admin/business-creation",
    FOOD_CATEGORIES: "/admin/food-categories",
    LOCALS: "/admin/locals",
    USERS: "/admin/users",
    DASHBOARD: "/admin/dashboard",
    SUPPORT_TICKETS: "/admin/support-tickets",
  },
  LOCAL: {
    DASHBOARD: "/business/dashboard",
    CALENDAR: "/business/calendar",
    MENU: "/business/menu",
    QR: "/business/qr",
    REVIEWS: "/business/reviews",
    SETTINGS: "/business/settings",
    EMPLOYEES: "/business/employees",
    SUBSCRIPTION: "/business/subscription",
  },
  LOADING: "/loading",
  ERROR: "/404",
};

export const appRoutes = [
  // Landing
  {
    path: ROUTES.PUBLIC.HOME,
    element: (
      <PublicRoute>
        <LandingHome />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.PUBLIC.ABOUT_US,
    element: (
      <PublicRoute>
        <AboutUs />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.PUBLIC.BUSINESS,
    element: (
      <PublicRoute>
        <LandingBusiness />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.PUBLIC.CHANGELOG,
    element: (
      <PublicRoute>
        <ChangeLog />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.PUBLIC.TERMS,
    element: (
      <PublicRoute>
        <TermsConditions />
      </PublicRoute>
    ),
  },

  // Auth
  {
    path: ROUTES.AUTH.LOGIN,
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.AUTH.REGISTER,
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.AUTH.REGISTER_LOCAL,
    element: <RegisterLocal />,
  },
  {
    path: ROUTES.AUTH.ONBOARDING,
    element: <Onboarding />,
  },
  { path: ROUTES.AUTH.RESET_PASSWORD, element: <ResetPassword /> },

  // User
  {
    path: ROUTES.USER.DASHBOARD,
    element: (
      <ProtectedRoute isBusiness={false}>
        <UDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USER.CREATE_POST,
    element: (
      <ProtectedRoute isBusiness={false}>
        <CreatePost />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USER.CREATE_RECIPE,
    element: (
      <ProtectedRoute isBusiness={false}>
        <CreateRecipe />
      </ProtectedRoute>
    ),
  },
  {
    path: `/explore/:category_id?/:category_slug?`,
    element: (
      <ProtectedRoute isBusiness={false}>
        <UExplore />
      </ProtectedRoute>
    ),
  },

  {
    path: `/profile/:user_id/:user_slug`,
    element: (
      <ProtectedRoute isBusiness={false}>
        <Profile />
      </ProtectedRoute>
    ),
  },

  {
    path: `${ROUTES.USER.CHAT}:chat_id?`,
    element: (
      <ProtectedRoute isBusiness={false}>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: `/c/:community_slug`,
    element: (
      <ProtectedRoute isBusiness={false}>
        <CommunityDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: `/p/:post_id/:post_slug`,
    element: (
      <ProtectedRoute isBusiness={false}>
        <PostDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: `${ROUTES.USER.RECIPE_PATH}`,
    element: (
      <ProtectedRoute isBusiness={false}>
        <RecipeDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USER.NOTIFICATIONS,
    element: (
      <ProtectedRoute isBusiness={false}>
        <Notifications />
      </ProtectedRoute>
    ),
  },

  // Admin
  {
    path: ROUTES.ADMIN.BUSINESS_CREATION,
    element: (
      <ProtectedRoute isAdmin>
        <AdminLayout>
          <AdminBusinessCreation />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ADMIN.FOOD_CATEGORIES,
    element: (
      <ProtectedRoute isAdmin>
        <AdminLayout>
          <AdminFoodCategories />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ADMIN.LOCALS,
    element: (
      <ProtectedRoute isAdmin>
        <AdminLayout>
          <AdminLocals />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ADMIN.USERS,
    element: (
      <ProtectedRoute isAdmin>
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ADMIN.DASHBOARD,
    element: (
      <ProtectedRoute isAdmin>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ADMIN.SUPPORT_TICKETS,
    element: (
      <ProtectedRoute isAdmin>
        <AdminLayout>
          <AdminSupportTickets />
        </AdminLayout>
      </ProtectedRoute>
    ),
  },

  // Local
  {
    path: ROUTES.LOCAL.DASHBOARD,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOCAL.MENU,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOCAL.DASHBOARD,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOCAL.MENU,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOCAL.QR,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalQR />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOCAL.REVIEWS,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalReviews />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOCAL.SETTINGS,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOCAL.CALENDAR,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalCalendar />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.LOCAL.EMPLOYEES,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalEmployees />
      </ProtectedRoute>
    ),
  },

  {
    path: ROUTES.LOCAL.SUBSCRIPTION,
    element: (
      <ProtectedRoute isBusiness={true}>
        <LocalSubscription />
      </ProtectedRoute>
    ),
  },
];
