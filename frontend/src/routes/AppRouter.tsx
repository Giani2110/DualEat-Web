import { BrowserRouter, Routes, Route } from "react-router-dom";
import { appRoutes } from "@/api/constants/constants";
import { Toaster } from "react-hot-toast";

import ScrollToTop from "@components/shared/ScrollToTop";
import Layout from "@layout/layout";
import NotFound from "@pages/public/error/NotFound";

import { AuthProvider } from "@context/auth/AuthProvider";
import { SocketProvider } from "@context/other/SocketContext";
import { NotificationsProvider } from "@context/other/NotificationsProvider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/pages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

function AppRoutesContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <Routes>
        {appRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <NotificationsProvider>
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
              <AppRoutesContent />
            </NotificationsProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default AppRouter;
