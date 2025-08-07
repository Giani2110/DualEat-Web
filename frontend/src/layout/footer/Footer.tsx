import React from "react";
import { Instagram, Twitter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/images/Logo_DualEat.png";
import GooglePlay from "../../assets/images/GooglePlay_Badge_Web.png";

import { OUT_NAVBAR_ROUTES } from "../../constants/navbar-routes";
import { ROUTES } from "../../constants/constants";

const Footer: React.FC = () => {
  const location = useLocation();

  if (Object.values(OUT_NAVBAR_ROUTES).includes(location.pathname)) {
  return null;
}

  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[60px]">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                
                <img src={Logo} alt="Logo" />
                
              </div>
              <span className="ml-2 text-[18px] Arvo-Bold">DualEat</span>
            </div>
            <p className="text6 text-[14px] leading-[27px] tracking-[-0.4px]">
              Una nueva forma de descubrir, cocinar y compartir experiencias
              gastronómicas.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <a
                href="#"
              >
                <img src={GooglePlay} alt="Google Play" className="w-[140px] h-[40px]" />
              </a>
            </div>
            <p className="text6 text-[12px] mt-[40px] leading-[27px] pt-3 border-t border-gray-200">
              © 2025 DualEat LLC. Todos los derechos reservados.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white Arvo-Bold mb-3 text-[16px]">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={ROUTES.LANDING.HOME}
                  className="text6 hover:text-white! transition-colors duration-300 text-[14px]"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.AUTH.LOGIN}
                  className="text6 hover:text-white! transition-colors duration-300 text-[14px]"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.AUTH.REGISTER}
                  className="text6 hover:text-white! transition-colors duration-300 text-[14px]"
                >
                  Registrarse
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.LANDING.BUSINESS}
                  className="text6 hover:text-white! transition-colors duration-300 text-[14px]"
                >
                  Para negocios
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-white Arvo-Bold mb-3 text-[16px]">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <span className="text6 hover:text-white! transition-colors duration-300 text-[14px]">
                  Documentos de ayuda
                </span>
              </li>
              <li>
                <span className="text6 hover:text-white! transition-colors duration-300 text-[14px]">
                  Guía de inicio rápido
                </span>
              </li>
              <li>
                <Link
                  to={ROUTES.LANDING.CHANGELOG}
                  className="text6 hover:text-white! transition-colors duration-300 text-[14px]"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Compañía y redes */}
          <div>
            <h3 className="text-white Arvo-Bold mb-3 text-[16px]">Compañía</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={ROUTES.LANDING.ABOUT_US}
                  className="text6 hover:text-white! transition-colors duration-300 text-[14px]"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.LANDING.TERMS}
                  className="text6 hover:text-white! transition-colors duration-300 text-[14px]"
                >
                  Términos y condiciones
                </Link>
              </li>
            </ul>
            <div className="flex flex-col space-x-3 mt-3">
             <div className="flex space-x-3">
              <a
                href="https://instagram.com/DualEat"
                target="_blank"
                rel="noopener noreferrer"
                className="text6 hover:text-white! transition-colors text-[14px]"
              >
                Instagram
              </a>
              <Instagram className="w-[18px] h-[18px]" />
              </div>
              <div className="flex space-x-3 mt-3">
              <a
                href="https://twitter.com/DualEat"
                target="_blank"
                rel="noopener noreferrer"
                className="text6 hover:text-white! transition-colors text-[14px]" 
              >
                Twitter
              </a>
              <Twitter className="w-[18px] h-[18px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
