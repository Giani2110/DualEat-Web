import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "../constants";
import ScrollToTop from "../components/ScrollToTop";
import Layout from "../layout/layout";

import { RegisterProvider } from "../context/RegisterContext";

function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <RegisterProvider>
          <Routes>
            {routes.map(({ path, element }, index) => (
              <Route key={index} path={path} element={element} />
            ))}
          </Routes>
        </RegisterProvider>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;
