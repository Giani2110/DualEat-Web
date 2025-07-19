import React from 'react'
import { Play, Instagram, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../assets/images/Logo_DualEat.png'

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  <img src={Logo} alt="Logo" />
                </span>
              </div>
              <span className="ml-2 text-xl font-semibold">DualEat</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Una nueva forma de descubrir, cocinar y compartir
              experiencias gastronómicas.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <a
                href="#"
                className="bg-white rounded-lg px-4 py-2 inline-flex items-center space-x-2 hover:bg-gray-100 transition-colors cursor-pointer self-start"
              >
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
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">Inicio</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Login</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Registrarse</Link></li>
              <li><Link to="/para-negocios" className="text-gray-400 hover:text-white transition-colors text-sm">Para negocios</Link></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400 text-sm">Documentos de ayuda</span></li>
              <li><span className="text-gray-400 text-sm">Guía de inicio rápido</span></li>
              <li><Link to="/changelog" className="text-gray-400 hover:text-white transition-colors text-sm">Changelog</Link></li>
            </ul>
          </div>

          {/* Compañía y redes */}
          <div>
            <h3 className="text-white font-semibold mb-4">Compañía</h3>
            <ul className="space-y-2">
              <li><Link to="/sobre-nosotros" className="text-gray-400 hover:text-white transition-colors text-sm">Sobre nosotros</Link></li>
              <li><Link to="/terminos-y-condiciones" className="text-gray-400 hover:text-white transition-colors text-sm">Términos y condiciones</Link></li>
            </ul>
            <div className="flex items-center space-x-3 mt-4">
              <a
                href="https://instagram.com/DualEat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/DualEat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
