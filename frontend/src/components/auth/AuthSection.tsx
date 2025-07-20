import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

import Restaurant from "../../assets/images/login/Restaurante.avif";
import Restaurant2 from "../../assets/images/login/Restaurante2.avif";
import Restaurant3 from "../../assets/images/login/Restaurante3.avif";
import LogoDualEat from "../../assets/images/Logo_DualEat.png";

interface Props {
  flex: string;
  color: string;
  title: string;
  subtitle: string;
  background: string;
  Dform: string;
  children?: React.ReactNode;
  children2?: React.ReactNode;
  items?: string;
}

const AuthSection: React.FC<Props> = ({
  flex,
  color,
  title,
  subtitle,
  children,
  children2,
  background,
  Dform,
  items,
}) => {
  const images: string[] = useMemo(
    () => [Restaurant, Restaurant2, Restaurant3],
    []
  );
  const carouselTexts: string[] = [
    "Explora bares, cafés y restaurantes que se alinean con tu estilo de vida y preferencias culinarias.",
    "Descubrí nuevas recetas, mejorá tu forma de comer y unite a una comunidad que ama experimentar en la cocina.",
    "Compartí tus recetas, seguí comunidades gastronómicas y viví la cocina como una experiencia compartida.",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);

  useEffect(() => {
    let loadedCount: number = 0;
    const totalImages: number = images.length;
    const imgElements: HTMLImageElement[] = []; // Para mantener referencias de las imágenes

    images.forEach((imageSrc: string) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesPreloaded(true);
        }
      };
      img.onerror = () => {
        console.error("Error al cargar la imagen:", imageSrc);
      };
      imgElements.push(img); // Almacenar para evitar que el GC las elimine
    });

    return () => {
      // No se requiere una limpieza específica para este caso, ya que las imágenes
      // precargadas no se desacoplan activamente del DOM, pero es buena práctica.
    };
  }, [images]); // Dependencia images si usas useMemo, o [] si las imágenes son estáticas

  useEffect(() => {
    if (imagesPreloaded) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex: number) => (prevIndex + 1) % images.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images.length, imagesPreloaded, currentImageIndex]); // Agregado currentImageIndex para el efecto de transición

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className={`min-h-screen ${flex} flex bg-gray`}>
      <div className="lg:w-1/2 flex flex-col justify-center p-8 max-w-[620px] mx-auto w-full">
        <Link to={"/"}>
          <div className="ps-5 flex items-center gap-1 text-gray-500 hover:text-black transition cursor-pointer py-2">
            <X className="w-6 h-6" />
            <span className=" text-[14px]">Salir</span>
          </div>
        </Link>
        <div className="mb-[60px]">
          <div className="flex justify-center mb-6">
            <div
              className={`w-[60px] h-[60px] ${color} rounded-lg flex items-center justify-center`}
            >
              <img
                src={LogoDualEat}
                alt="DualEat Logo"
                className="w-[30px]  h-auto object-contain p-1"
              />
            </div>
          </div>
          <h3 className="font-bold text3 text-[30px] mb-2 text-center">
            {title}
          </h3>
          <p className="text4 text-center">{subtitle}</p>
        </div>
        <div className="space-y-6">
          {children}
          <div className="flex w-full items-center justify-around my-6">
            <div className="w-[35%] border-t border-gray-300"></div>

            <span className="px-2 text6">O continúa con</span>

            <div className="w-[35%] border-t border-gray-300"></div>
          </div>

          {/* Botones de inicio de sesión social */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => console.log("Google login")}
              className="flex text-[15px] items-center cursor-pointer justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
              Google
            </button>
            <button
              type="button"
              onClick={() => console.log("iOS login")}
              className="flex text-[15px] items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#000000"
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </svg>
              iOS
            </button>
          </div>
          {children2}
        </div>
      </div>

      <div className="w-full lg:w-1/2 relative overflow-hidden">
        {/* Renderizar imagen condicionalmente una vez cargada o mostrar placeholder */}
        {imagesPreloaded ? (
          <div
            className={`${background} absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out`}
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%), url(${images[currentImageIndex]})`,
            }}
          ></div>
        ) : (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            <p className="text-white text-lg">Cargando imágenes...</p>
          </div>
        )}

        {/* Logo y texto superpuesto con contenedor en forma D espejada y centrada */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div
            className={`${Dform} px-[50px] ${items} py-[70px] flex flex-col`}
          >
            <div className={`flex flex-col ${items} mb-6`}>
              <img
                src={LogoDualEat}
                alt="DualEat Logo"
                className="w-[50px] h-auto mb-[40px]"
              />
              <h1 className="text-[18px] text2">Bienvenido/a a</h1>
              <h2 className="text-[36px] text-white font-bold mb-3">DualEat</h2>
              <p className="text-[16px] text2">
                {carouselTexts[currentImageIndex]}
              </p>
            </div>
            {/* Indicadores del carrusel alineados a la derecha */}
            <div className="flex space-x-2 mt-auto">
              {images.map((_, index: number) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-1 ${
                    currentImageIndex === index
                      ? "w-[45px] bg-white rounded-full"
                      : "w-[30px] cursor-pointer rounded-full bg-gray-400 opacity-60"
                  } transition-all duration-300`}
                  aria-label={`Ir a la diapositiva ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSection;
