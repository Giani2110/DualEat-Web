import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Onboarding from "../pages/auth/Onboarding";
import ProtectedRoute from "../components/ProtectedRoutes";
import ResetPassword from "../pages/auth/ResetPassword";

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
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: "/password_reset",
    element: (
        <ResetPassword />
    ),
  }

  
];