import { ROUTES } from "./constants";

export const NAVBAR_ROUTES = [
  { path: ROUTES.LANDING.ABOUT_US, label: "Sobre nosotros" },
  { path: `${ROUTES.LANDING.HOME}#Funcionalidades`, label: "Funcionalidades" },
  { path: ROUTES.LANDING.BUSINESS, label: "Para negocios" },
];

export const OUT_NAVBAR_ROUTES = {
  LOGIN: ROUTES.AUTH.LOGIN,
  REGISTER: ROUTES.AUTH.REGISTER,
  ONBOARDING: ROUTES.AUTH.ONBOARDING,
  RESET_PASSWORD: ROUTES.AUTH.RESET_PASSWORD
}