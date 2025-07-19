import React from "react";
import { Play } from "lucide-react";
import Logo from "../assets/images/Logo_DualEat.png";

interface Props {
  background: string;
  background2: string;
}

const DownloadSectionBG: React.FC<Props> = ({ background, background2 }) => {
  return (
    <section className={`${background} rounded-3xl h-[400px] overflow-hidden relative`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        {/* Contenido Izquierdo */}
        <div className="md:w-[60%] text-center md:text-left mb-12 md:mb-0 z-10">
          <h1 className="text-[32px]  font-extrabold text-white leading-tight mb-6">
            Descargá DualEat y descubrí un mundo lleno de sabores
          </h1>
          <p className="text-[16px] tracking-tight text-white mb-7 max-w-[700px]">
            Descubrí restaurantes, bares y cafeterías que se adaptan a tus
            gustos. Con DualEat, encontrás espacios únicos y comunidades
            gastronómicas que reflejan tu estilo y paladar. Explorá, valorá y
            viví nuevas experiencias en cada salida.
          </p>
          <div className="flex justify-center md:justify-start animate-fade-in-up delay-200">
            <button
              type="button"
              title="Descargar en Google Play"
              className="bg-white text-red-600 h-[50px] px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Google Play</span>
            </button>
          </div>
        </div>

        {/* Contenido Derecho - Mockup del Móvil */}
        <div className="md:w-[30%] flex justify-center md:justify-end z-10">
          <div className="relative border border-white w-72 h-[450px] bg-gray-800 rounded-3xl shadow-2xl flex items-center justify-center p-2 transform rotate-3 scale-105 transition-all duration-500 ease-out hover:rotate-0 hover:scale-110">
            {/* Pantalla del teléfono */}
            <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden">
              {/* Barra de estado simulada */}
              <div
                className={`absolute top-0 left-0 right-0 h-10 ${background2} flex items-center justify-between px-4 text-white text-xs font-semibold rounded-t-2xl`}
              >
                <span>9:41</span>
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                  </svg>
                </div>
              </div>

              {/* Contenido de la App Simulada */}
              <div className="pt-10 h-full flex flex-col">
                {/* Red top section */}
                <div className={`h-32 ${background2} flex-none relative`}>
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center z-0">
                    <img
                      className="object-contain w-24 h-24 opacity-30"
                      src={Logo}
                      alt="DualEat Logo Watermark"
                    />
                  </div>
                </div>

                {/* White section */}
                <div className="bg-white px-6 py-10 flex-1 rounded-t-3xl relative -mt-8">
                  {/* Logo */}
                  <div
                    className={`absolute ${background2} top-12 left-1/2 -translate-x-1/2 w-36 h-12 sm:w-40 sm:h-12 flex items-center justify-center shadow-lg rounded-full`}
                  >
                    <img className="w-6 h-6" src={Logo} alt="Logo" />
                  </div>

                  {/* Content below logo */}
                  <div className="text-center pt-24">
                    <h2 className="text-gray-800 font-bold text-lg mb-2">
                      Inicia sesión en DualEat
                    </h2>
                    <p className="text-gray-500 text-sm mb-8 italic">
                      "Conectate con tu comida, como nunca antes"
                    </p>

                    {/* Social buttons */}
                    <div className="flex justify-center space-x-6">
                      {/* Google */}
                      <button
                        type="button"
                        title="Descargar en Google Play"
                        className="flex items-center justify-center w-12 h-12 border-2 border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      </button>

                      {/* Apple */}
                      <button
                        type="button"
                        title="Descargar en Apple Store"
                        className="flex items-center justify-center w-12 h-12 border-2 border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Altavoz y cámara */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-gray-700 rounded-full"></div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 mt-3 w-3 h-3 bg-gray-600 rounded-full"></div>

            {/* Botones laterales */}
            <div className="absolute left-0 top-1/4 w-1 h-10 bg-gray-700 rounded-l-sm"></div>
            <div className="absolute right-0 top-1/3 w-1 h-14 bg-gray-700 rounded-r-sm"></div>
            <div className="absolute right-0 top-1/2 w-1 h-14 bg-gray-700 rounded-r-sm"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSectionBG;
