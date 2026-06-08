import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@assets/images/icon/Logo_DualEat.png";
import GooglePlay from "@assets/images/GooglePlay_Badge_Web.png";

import { OUT_NAVBAR_ROUTES } from "@/api/constants/navbar-routes";
import { ROUTES } from "@/api/constants/constants";

const Footer: React.FC = () => {
  const location = useLocation();

  if (Object.values(OUT_NAVBAR_ROUTES).includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[70px]">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center">
                <img src={Logo} alt="Logo" />
              </div>
              <span className="ml-2 text-[16px] font-bold">DualEat</span>
            </div>
            <p className="text6 text-[13px] leading-[27px] tracking-[-0.4px]">
              Una nueva forma de descubrir, cocinar y compartir experiencias
              gastronómicas.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <a href="#">
                <img
                  src={GooglePlay}
                  alt="Google Play"
                  className="w-[140px] h-[40px]"
                />
              </a>
            </div>
            <p className="text6 text-[11px] mt-[40px] leading-[27px] pt-3 border-t border-gray-200">
              © 2025 DualEat LLC. Todos los derechos reservados.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-3 text-[14px]">Links</h3>
            <ul className="space-y-2 text6 text-[12px] transition-colors duration-300 cursor-pointer">
              <li className="py-1">
                <Link to={ROUTES.PUBLIC.HOME} className="hover:text-white!">
                  Inicio
                </Link>
              </li>
              <li className="py-1">
                <Link to={ROUTES.AUTH.LOGIN} className="hover:text-white!">
                  Login
                </Link>
              </li>
              <li className="py-1">
                <Link to={ROUTES.AUTH.REGISTER} className="hover:text-white!">
                  Registrarse
                </Link>
              </li>
              <li className="py-1">
                <Link to={ROUTES.PUBLIC.BUSINESS} className="hover:text-white!">
                  Para negocios
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-white font-bold mb-3 text-[14px]">Recursos</h3>
            <ul className="space-y-2 text6 text-[12px] transition-colors duration-300 cursor-pointer">
              <li className="py-1">
                <span className=" hover:text-white!">Documentos de ayuda</span>
              </li>
              <li className="py-1">
                <span className=" hover:text-white!">
                  Guía de inicio rápido
                </span>
              </li>
              <li className="py-1">
                <Link
                  to={ROUTES.PUBLIC.CHANGELOG}
                  className=" hover:text-white!"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Compañía y redes */}
          <div>
            <h3 className="text-white font-bold mb-3 text-[14px]">Compañía</h3>
            <ul className="space-y-2 text6 transition-colors duration-300 text-[12px]">
              <li className="py-1">
                <Link to={ROUTES.PUBLIC.ABOUT_US} className="hover:text-white!">
                  Sobre nosotros
                </Link>
              </li>
              <li className="py-1">
                <Link to={ROUTES.PUBLIC.TERMS} className="hover:text-white!">
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
