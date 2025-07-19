import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "../constants";
import ScrollToTop from "../components/ScrollToTop";
import Layout from "../layout/layout";

function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          {routes.map(({ path, element }, index) => (
            <Route key={index} path={path} element={element} />
          ))}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;
