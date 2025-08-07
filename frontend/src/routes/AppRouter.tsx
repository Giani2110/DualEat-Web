import { BrowserRouter, Routes, Route } from "react-router-dom";
import { appRoutes } from "../constants/constants";
import { Toaster } from "react-hot-toast";

import ScrollToTop from "../components/ScrollToTop";
import Layout from "../layout/layout";

import { RegisterProvider } from "../context/RegisterContext";

function AppRouter() {
  return (
    <BrowserRouter>
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
        <RegisterProvider>
          <Routes>
            {appRoutes.map(({ path, element }, index) => (
              <Route key={index} path={path} element={element} />
            ))}
          </Routes>
        </RegisterProvider>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;
