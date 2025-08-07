import { Login, Register, Onboarding, ResetPassword, LandingHome, AboutUs, LandingBusiness, ChangeLog, TermsConditions, ProtectedRoute } from "../pages";

export const ROUTES = {
  LANDING: {
    HOME: "/",
    ABOUT_US: "/sobre-nosotros",
    BUSINESS: "/para-negocios",
    CHANGELOG: "/changelog",
    TERMS: "/terminos-y-condiciones",
  },
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    ONBOARDING: "/onboarding",
    RESET_PASSWORD: "/password_reset",
  },
};


export const appRoutes = [
  // Landing
  { path: ROUTES.LANDING.HOME, element: <LandingHome /> },
  { path: ROUTES.LANDING.ABOUT_US, element: <AboutUs /> },
  { path: ROUTES.LANDING.BUSINESS, element: <LandingBusiness /> },
  { path: ROUTES.LANDING.CHANGELOG, element: <ChangeLog /> },
  { path: ROUTES.LANDING.TERMS, element: <TermsConditions /> },

  // Auth
  { path: ROUTES.AUTH.LOGIN, element: <Login /> },
  { path: ROUTES.AUTH.REGISTER, element: <Register /> },
  {
    path: ROUTES.AUTH.ONBOARDING,
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
  { path: ROUTES.AUTH.RESET_PASSWORD, element: <ResetPassword /> },
];

