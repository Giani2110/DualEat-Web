import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Onboarding from "../pages/auth/Onboarding";
import ProtectedRoute from "../components/ProtectedRoutes";

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
  
];