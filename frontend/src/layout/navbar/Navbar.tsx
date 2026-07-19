import { useState } from "react";

import { Link, useLocation } from "react-router-dom";
import { OUT_NAVBAR_ROUTES } from "@/api/constants/navbar-routes";
import { ROUTES } from "@/api/constants/constants";

import { ChevronRight } from "lucide-react";
import Logo from "@assets/icon/Logo_DualEat.png";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export const NAVBAR_ROUTES = [
  { path: ROUTES.PUBLIC.HOME, label: "Inicio" },
  { path: ROUTES.PUBLIC.ABOUT_US, label: "Nosotros" },
  { path: `${ROUTES.PUBLIC.HOME}#Funcionalidades`, label: "Funcionalidades" },
  { path: ROUTES.PUBLIC.BUSINESS, label: "Para negocios" },
];

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const { scrollY } = useScroll();

  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();

    if (previous === undefined) return;

    if (latest > previous && latest > 200) {
      setHidden(true);
    } else if (latest < previous) {
      setHidden(false);
    }
  });

  if (Object.values(OUT_NAVBAR_ROUTES).includes(location.pathname)) {
    return null;
  }

  if (user) return null;

  return (
    <motion.header
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ marginTop: 2 }}
      className={`fixed flex flex-row px-8 justify-between md:justify-around items-center top-0 w-full z-50 py-4 transition-all duration-300 backdrop-blur-md`}
    >
      <Link
        to={ROUTES.PUBLIC.HOME}
        className="flex items-center cursor-pointer hover:scale-110 duration-100"
      >
        <img className="w-7 h-7" src={Logo} alt="Logo" />
      </Link>
      <nav className="hidden md:flex items-center space-x-8 text4 text-sm">
        {NAVBAR_ROUTES.map((route) => (
          <a
            key={route.label}
            href={route.path}
            className={` ${
              location.pathname === route.path
                ? "font-bold text-[#b53325]!"
                : undefined
            } text-text-2 hover:text-[#b53325]! transition-all duration-200`}
          >
            {route.label}
          </a>
        ))}
      </nav>

      <div className="items-center flex gap-5 text-sm text-white *:hover:scale-105 transition-all *:duration-200">
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="flex gap-x-2 items-center border border-gray-200 px-4 md:px-6 py-1 md:py-2 group"
        >
          <ChevronRight
            className="group-hover:translate-x-1 hidden md:block transition-all duration-200"
            size={16}
          />
          <p>Iniciar sesión</p>
        </Link>
        <Link
          to={ROUTES.AUTH.REGISTER}
          className="flex gap-x-2 items-center border border-gray-200 bg-bg-red px-4 md:px-6 py-1 md:py-2 group"
        >
          <ChevronRight
            className="group-hover:translate-x-1 hidden md:block transition-all duration-200"
            size={16}
          />
          <p>Registrarse</p>
        </Link>
      </div>
    </motion.header>
  );
}
