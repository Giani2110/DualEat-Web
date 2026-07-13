import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@assets/icon/Logo_DualEat.png";
import { OUT_NAVBAR_ROUTES } from "@/api/constants/navbar-routes";
import { ROUTES } from "@/api/constants/constants";
import { ArrowUp } from "lucide-react";

const Footer: React.FC = () => {
  const location = useLocation();

  if (Object.values(OUT_NAVBAR_ROUTES).includes(location.pathname)) {
    return null;
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-text-1">
      <div className="w-full max-w-7xl py-16 px-6 mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
        <div className="col-span-12 md:col-span-4 flex flex-col gap-y-5">
          <div className="flex items-center gap-x-2.5">
            <img src={Logo} className="w-7 h-7" alt="Logo" />
            <span className="font-bold text-xl uppercase tracking-wider text-text-1">
              DualEat
            </span>
          </div>
          <p className="text-sm text-text-2 leading-relaxed max-w-xs font-light">
            El sabor de salir. El placer de cocinar. <br />
            Dos mundos, una sola experiencia gastronómica para simplificar tu
            día a día.
          </p>
        </div>

        <div className="col-span-12 md:col-span-5 flex flex-col gap-y-4">
          <span className="text-[11px] uppercase tracking-widest text-text-6 font-bold">
            Páginas
          </span>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[15px]">
            <div className="flex flex-col gap-y-2.5">
              <Link
                to={ROUTES.PUBLIC.HOME}
                className="text-text-2 hover:text-[#B53325] transition-colors duration-200"
              >
                Inicio
              </Link>
              <Link
                to={ROUTES.PUBLIC.ABOUT_US}
                className="text-text-2 hover:text-[#B53325] transition-colors duration-200"
              >
                Sobre nosotros
              </Link>
              <Link
                to={ROUTES.PUBLIC.BUSINESS}
                className="text-text-2 hover:text-[#B53325] transition-colors duration-200"
              >
                Para negocios
              </Link>
            </div>
            <div className="flex flex-col gap-y-2.5">
              <Link
                to={ROUTES.AUTH.LOGIN}
                className="text-text-2 hover:text-[#B53325] transition-colors duration-200"
              >
                Iniciar sesión
              </Link>
              <Link
                to={ROUTES.AUTH.REGISTER}
                className="text-text-2 hover:text-[#B53325] transition-colors duration-200"
              >
                Registrarse
              </Link>
              <Link
                to={ROUTES.PUBLIC.TERMS}
                className="text-text-2 hover:text-[#B53325] transition-colors duration-200"
              >
                Términos y condiciones
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Follow Us & Back to Top */}

        <button
          title="Ir arriba"
          onClick={handleScrollToTop}
          className="flex flex-row items-center gap-x-2.5 group cursor-pointer flex-1 w-full"
        >
          <span className="p-2 rounded-full bg-black border border-white/10 flex items-center justify-center group-hover:border-white transition-all duration-200">
            <ArrowUp
              size={14}
              className="text-white group-hover:-translate-y-0.5 transition-transform duration-200"
            />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-2 group-hover:text-white transition-all duration-200">
            Volver arriba
          </span>
        </button>
      </div>

      <div className="w-full flex p-4 justify-end border-t border-gray-800">
        <span className="text-[10px] uppercase tracking-widest text-text-2 group-hover:text-white transition-all duration-200">
          DualEat © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
