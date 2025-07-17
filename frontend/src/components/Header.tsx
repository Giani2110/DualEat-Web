import React from 'react';
import Logo from '../assets/images/Logo_DualEat.png'; // Ajusta la ruta si es necesario
import { Link } from 'react-router-dom'


const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center group">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-sm"><img className="w-4 h-4" src={Logo} alt="Logo" /></span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900">DualEat</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/sobre-nosotros" className="text-gray-700 hover:text-red-500 transition-colors duration-200">
              Sobre nosotros
            </Link>
            <Link to="/" className="text-gray-700 hover:text-red-500 transition-colors duration-200">
              Funcionalidades
            </Link>
            <Link to="/para-negocios" className="text-gray-700 hover:text-red-500 transition-colors duration-200">
              Para negocios
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 hidden md:block"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;