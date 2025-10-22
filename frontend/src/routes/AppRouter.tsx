import { BrowserRouter, Routes, Route } from "react-router-dom";
import { appRoutes } from "../constants/constants";
import { Toaster } from "react-hot-toast";
import { CommunityProvider } from "../context/other/CommunityProvider";

import ScrollToTop from "../components/shared/ScrollToTop";
import Layout from "../layout/layout";
import NotFound from "../pages/error/NotFound";

import { AuthProvider } from "../context/auth/AuthProvider";
import { SocketProvider } from "../context/other/SocketContext";
import { NotificationsProvider } from "../context/other/NotificationsProvider";

function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationsProvider>
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
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
              
            </CommunityProvider>
          </NotificationsProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRouter;
