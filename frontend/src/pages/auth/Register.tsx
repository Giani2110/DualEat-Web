import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Restaurant from '../../assets/images/login/Restaurante.jpg';
import Restaurant2 from '../../assets/images/login/Restaurante2.jpg';
import Restaurant3 from '../../assets/images/login/Restaurante3.jpg';
import LogoDualEat from '../../assets/images/Logo_DualEat.png';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const images: string[] = [Restaurant, Restaurant2, Restaurant3];
  const carouselTexts: string[] = [
    "Explora bares, cafés y restaurantes que se alinean con tu estilo de vida y preferencias culinarias.",
    "Descubrí nuevas recetas, mejorá tu forma de comer y unite a una comunidad que ama experimentar en la cocina.",
    "Compartí tus recetas, seguí comunidades gastronómicas y viví la cocina como una experiencia compartida."
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

  useEffect(() => {
    let loadedCount: number = 0;
    const totalImages: number = images.length;

    images.forEach((imageSrc: string) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        console.error('Error al cargar la imagen:', imageSrc);
      };
    });
  }, [images]);

  useEffect(() => {
    if (imagesLoaded) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex: number) => (prevIndex + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images.length, imagesLoaded]);

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Lado izquierdo - Formulario de registro */}
      <div className="w-1/2 bg-white flex flex-col justify-center p-8">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <img src={LogoDualEat} alt="DualEat Logo" className="w-10 h-auto object-contain p-1" />
              </div>
            </div>
            <h3 className="font-bold text-gray-800 mb-2 text-center" style={{ fontSize: '30px' }}>Crear cuenta</h3>
            <p className="text-gray-500 text-center" style={{ fontSize: '15px' }}>
              Completa tus datos para comenzar tus aventuras culinarias
            </p>
          </div>

          <div className="space-y-6">
            {/* Campo de email */}
            <div>
              <div className="block font-medium text-gray-700 mb-2" style={{ fontSize: '15px' }}>
                Email
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  style={{ fontSize: '15px' }}
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div>
              <div className="block font-medium text-gray-700 mb-2" style={{ fontSize: '15px' }}>
                Contraseña
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none pr-12"
                  style={{ fontSize: '15px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Campo de confirmar contraseña */}
            <div>
              <div className="block font-medium text-gray-700 mb-2" style={{ fontSize: '15px' }}>
                Confirmar contraseña
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none pr-12"
                  style={{ fontSize: '15px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Botón de registro */}
            <button
              onClick={() => console.log('Register clicked')}
              className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors font-medium"
              style={{ fontSize: '15px' }}
            >
              Registrarse →
            </button>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-gray-500" style={{ fontSize: '15px' }}>O continúa con</span>
              </div>
            </div>

            {/* Botones de registro con redes sociales */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => console.log('Google register')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ fontSize: '15px' }}
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
                onClick={() => console.log('iOS register')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ fontSize: '15px' }}
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

            {/* Enlace para ir al login */}
            <div className="text-center">
              <span className="text-gray-600" style={{ fontSize: '15px' }}>¿Ya tienes cuenta? </span>
              <button className="text-red-500 hover:text-red-600 font-medium" style={{ fontSize: '15px' }}>
                Inicia sesión en DualEat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Imagen del restaurante con forma D espejada */}
      <div className="w-1/2 relative overflow-hidden bg-white">
        {/* Renderizar imagen condicionalmente una vez cargada o mostrar placeholder */}
        {imagesLoaded ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%), url(${images[currentImageIndex]})`,
              borderTopLeftRadius: '80px',
              borderBottomLeftRadius: '80px',
            }}
          ></div>
        ) : (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            <p className="text-white text-lg">Cargando imágenes...</p>
          </div>
        )}

        {/* Logo y texto superpuesto con contenedor en forma D espejada y centrada */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full p-16 text-white">
          <div
            className="bg-black bg-opacity-20 backdrop-blur-xs p-8 rounded-l-3xl flex flex-col justify-between text-right"
            style={{
              borderTopLeftRadius: '250px',
              borderBottomLeftRadius: '250px',
              maxWidth: '400px',
              minHeight: '450px',
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
            }}
          >
            <div>
              <img src={LogoDualEat} alt="DualEat Logo" className="w-10 h-auto mb-6 ml-auto" />
              <h1 className="font-bold mb-2" style={{ fontSize: '18px' }}>Bienvenido/a a</h1>
              <h2 className="font-bold mb-6" style={{ fontSize: '36px' }}>DualEat</h2>
              <p className="text-gray-200" style={{ fontSize: '15px' }}>
                {carouselTexts[currentImageIndex]}
              </p>
            </div>
            {/* Indicadores del carrusel alineados a la derecha */}
            <div className="flex justify-end space-x-2 mt-auto">
              {images.map((_, index: number) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2 ${
                    currentImageIndex === index ? 'w-6 bg-white' : 'w-3 rounded-full bg-gray-400 opacity-60'
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

export default Register;