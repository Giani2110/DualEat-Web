import {
  Login,
  Register,
  Onboarding,
  ResetPassword,
  LandingHome,
  AboutUs,
  LandingBusiness,
  ChangeLog,
  TermsConditions,
  ProtectedRoute,
  UserDashboard,
  AdminBusinessCreation,
  AdminFoodCategories,
  AdminLocals,
  LocalDashboard,
} from "../pages";

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
    ONBOARDING: "/onboarding",
    RESET_PASSWORD: "/password_recovery",
  },
  USER: {
    DASHBOARD: "/feed",
  },
  ADMIN: {
    BUSINESS_CREATION: "/admin/business-creation",
    FOOD_CATEGORIES: "/admin/food-categories",
    LOCALS: "/admin/locals",
  },
  LOCAL: {
    DASHBOARD: "/local/dashboard",
  },
};

export const appRoutes = [
  // Landing
  { path: ROUTES.PUBLIC.HOME, element: <LandingHome /> },
  { path: ROUTES.PUBLIC.ABOUT_US, element: <AboutUs /> },
  { path: ROUTES.PUBLIC.BUSINESS, element: <LandingBusiness /> },
  { path: ROUTES.PUBLIC.CHANGELOG, element: <ChangeLog /> },
  { path: ROUTES.PUBLIC.TERMS, element: <TermsConditions /> },

  // Auth
  { path: ROUTES.AUTH.LOGIN, element: <Login /> },
  { path: ROUTES.AUTH.REGISTER, element: <Register /> },
  {
    path: ROUTES.AUTH.ONBOARDING,
    element: (
      <ProtectedRoute onlyTempToken>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
  { path: ROUTES.AUTH.RESET_PASSWORD, element: <ResetPassword /> },

  // User
  {
    path: ROUTES.USER.DASHBOARD,
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },

  // Admin
  { path: ROUTES.ADMIN.BUSINESS_CREATION, element: <AdminBusinessCreation /> },
  { path: ROUTES.ADMIN.FOOD_CATEGORIES, element: <AdminFoodCategories /> },
  { path: ROUTES.ADMIN.LOCALS, element: <AdminLocals /> },

  // Local
  { path: ROUTES.LOCAL.DASHBOARD, element: <LocalDashboard /> },
];
