import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { routes } from './constants/routes'
import ScrollToTop from './components/ScrollToTop'

function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {routes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter