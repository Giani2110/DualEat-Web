import { BrowserRouter, Routes, Route } from "react-router-dom";
import { appRoutes } from "../constants/constants";
import { Toaster } from "react-hot-toast";
import { CommunityProvider } from "../context/other/CommunityProvider";

import ScrollToTop from "../components/shared/ScrollToTop";
import Layout from "../layout/layout";

import { AuthProvider } from "../context/auth/AuthProvider";
import { SocketProvider } from "../context/other/SocketContext";

function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <CommunityProvider>
            <ScrollToTop />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#333",
                  color: "#fff",
                },
              }}
            />
            <Layout>
              <Routes>
                {appRoutes.map(({ path, element }, index) => (
                  <Route key={index} path={path} element={element} />
                ))}
              </Routes>
            </Layout>
          </CommunityProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRouter;
