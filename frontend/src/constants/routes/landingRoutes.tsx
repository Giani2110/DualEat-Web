import LandingHome from '../../pages/landing/LandingHome'
import AboutUs from '../../pages/landing/AboutUs'
import LandingBusiness from '../../pages/landing/LandingBusiness'
import ChangeLog from '../../pages/legal/ChangeLog'
import TermsConditions from '../../pages/legal/TermsConditions'

export const landingRoutes = [
    {
        path: '/',
        element: <LandingHome />,
    },
    {
        path: '/sobre-nosotros',
        element: <AboutUs />,
    },
    {
        path: '/para-negocios',
        element: <LandingBusiness />,
    },
    {
        path: '/changelog',
        element: <ChangeLog />,
    },
    {
        path: '/terminos-y-condiciones',
        element: <TermsConditions />,
    },
]