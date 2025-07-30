import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Onboarding from "../pages/auth/Onboarding";

export const authRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
];
