import React from 'react';
import { Play, Instagram, Twitter } from 'lucide-react';
import Logo from '../assets/images/Logo_DualEat.png'; // Ajusta la ruta si es necesario

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm"><img src={Logo} alt="Logo" /></span>
              </div>
              <span className="ml-2 text-xl font-semibold">DualEat</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Una nueva forma de descubrir cocinar y compartir
              experiencias gastronómicas.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <a href="#" className="bg-white rounded-lg px-4 py-2 inline-flex items-center space-x-2 hover:bg-gray-100 transition-colors cursor-pointer self-start">
                <Play className="w-4 h-4 text-black" />
                <span className="text-black text-sm font-medium">Google Play</span>
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              © 2025 DualEat LLC. Todos los derechos reservados.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Inicio</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Login</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Registrarse</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Para negocios</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Documentos de ayuda</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Guía de inicio rápido</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Changelog</a></li>
            </ul>
          </div>

          {/* Company and Socials Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Compañía</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Sobre nosotros</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Términos y condiciones</a></li>
            </ul>
            <div className="flex items-center space-x-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;