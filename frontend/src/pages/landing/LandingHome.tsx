import React, { useState, useEffect } from "react";
import DownloadSectionBG from "../../components/DownloadSectionBG";
import Restaurante1 from "../../assets/images/auth/Restaurante2.avif";
import Restaurante2 from "../../assets/images/auth/Restaurante.avif";

import FOOD from "../../assets/images/landing/Food.jpg";
import BUSINESS from "../../assets/images/landing/Business.jpg";

import "../../assets/scss/landing/landing.scss";

import {
  Utensils,
  Home,
  Trophy,
  Star,
  StarHalf,
  MapPin,
  Shield,
  Zap,
  Smartphone,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const LandingHome: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentFeatureSlide, setCurrentFeatureSlide] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const slides = [
    {
      title: (
        <>
          <span className="italic underline decoration-black font-bold">
            Descubrí
          </span>{" "}
          lugares que
          <br />
          reflejan tus{" "}
          <span className="italic underline decoration-black font-bold">
            gustos
          </span>
        </>
      ),
      description: (
        <p className="text-[15px] text4 mb-[40px] leading-[30px]">
          DualEat te conecta con{" "}
          <span className="font-bold text5">
            experiencias gastronómicas únicas
          </span>
          , ya sea en tu ciudad o en casa. Comé mejor, cocina distinto, compartí
          tu pasión.
        </p>
      ),
      image: Restaurante1,
      usersText: (
        <span className="text-[14px] text4">
          <span className="font-bold text5">+500</span> usuarios registrados que
          buscan una verdadera experiencia gastronómica
        </span>
      ),
      showStars: true,
      showAvatars: true,
    },
    {
      title: (
        <>
          <span className="italic underline decoration-black font-bold">
            Tu negocio
          </span>{" "}
          en
          <br />
          <span className="italic underline decoration-black font-bold">
            crecimiento
          </span>{" "}
          constante
        </>
      ),
      description: (
        <p className="text-[15px] text4 mb-[40px] leading-[30px]">
          Potencia tu <span className="font-bold text5">restaurante</span> con
          DualEat. Alcanza nuevos clientes, gestiona tu menú y utiliza nuestro
          dashboard para ver todas las estadísticas de tu negocio.
        </p>
      ),
      image: Restaurante2,
      usersText: (
        <span className="text-[14px] text4">
          <span className="font-bold text5">+100</span> negocios asociados en
          nuestra plataforma.
        </span>
      ),
      showStars: true,
      showAvatars: true,
    },
  ];

  const businessFeatures = [
    {
      title: "Accesible desde cualquier lugar",
      subtitle:
        "Tu DualEat está disponible desde tu teléfono, tablet o computadora, ofreciendo flexibilidad total para gestionar tu negocio desde donde estés.",
      icon: <MapPin className="w-6 h-6 text-red" />,
      badge: "Web",
    },
    {
      title: "Seguridad y privacidad de tus datos",
      subtitle:
        "Protegemos tu información con los más altos estándares de seguridad y cifrado, garantizando que tus datos estén siempre seguros.",
      icon: <Shield className="w-6 h-6 text-red" />,
      badge: "Seguro",
    },
    {
      title: "Listo para escalar contigo",
      subtitle:
        "Nuestra plataforma crece junto a tu negocio, adaptándose a tus necesidades sin límites de capacidad o funcionalidad.",
      icon: <Zap className="w-6 h-6 text-red" />,
      badge: "Escalable",
    },
    {
      title: "Sencillos pasos",
      subtitle:
        "Configurá tu restaurante en minutos con nuestro proceso intuitivo y empezá a recibir clientes inmediatamente.",
      icon: <Smartphone className="w-6 h-6 text-red" />,
      badge: "Fácil",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (hoveredFeature !== null) return;

    const interval = setInterval(() => {
      setCurrentFeatureSlide((prev) => (prev + 1) % businessFeatures.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [hoveredFeature, businessFeatures.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(
      (prevSlide) => (prevSlide - 1 + slides.length) % slides.length
    );
  };

  const currentSlideContent = slides[currentSlide];

  return (
    <div className="min-h-screen">
      <section className="bgLanding pt-[200px] pb-[110px] px-4">
        {/* Hero Section */}
        <div className="pb-20 px-4 relative max-w-[1500px] mx-auto z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Navigation Arrows */}
              <div className="absolute left-0 top-[10%] flex flex-col space-y-4 items-center">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Previous slide"
                >
                  <ArrowUp color="#B53325" className="w-6 h-6" />
                </button>
                <div className="text-[22px] tracking-tight space-y-3  text-red flex flex-col items-center">
                  <h1 className={` ${currentSlide != 0 && "opacity-50"}`}>
                    01
                  </h1>
                  <h1 className={` ${currentSlide != 1 && "opacity-50"}`}>
                    02
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Next slide"
                >
                  <ArrowDown color="#B53325" className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 pl-[100px]">
                <h1 className="text-[40px] text3 leading-[55px]">
                  {currentSlideContent.title}
                </h1>

                <div className="max-w-lg">
                  {currentSlideContent.description}

                  {/* User avatars and stars/text */}
                  <div className="flex items-center mb-4">
                    {currentSlideContent.showAvatars && (
                      <div className="flex justify-center items-center space-x-[-22px] bg-gray h-[70px] w-[250px] rounded-full">
                        <img
                          className="w-[40px] h-[40px] rounded-full border-2 border-white object-cover"
                          src="https://placehold.co/32x32/FF6B6B/FFFFFF?text=A"
                          alt="Avatar A"
                        />
                        <img
                          className="w-[40px] h-[40px] rounded-full border-2 border-white object-cover"
                          src="https://placehold.co/32x32/6B8EFF/FFFFFF?text=J"
                          alt="Avatar J"
                        />
                        <img
                          className="w-[40px] h-[40px] rounded-full border-2 border-white object-cover"
                          src="https://placehold.co/32x32/6BEB6B/FFFFFF?text=P"
                          alt="Avatar P"
                        />
                        <img
                          className="w-[40px] h-[40px] rounded-full border-2 border-white object-cover"
                          src="https://placehold.co/32x32/EBEB6B/FFFFFF?text=M"
                          alt="Avatar M"
                        />
                        <img
                          className="w-[40px] h-[40px] rounded-full border-2 border-white object-cover"
                          src="https://placehold.co/32x32/B86BEB/FFFFFF?text=G"
                          alt="Avatar G"
                        />
                        <img
                          className="w-[40px] h-[40px] rounded-full border-2 border-white object-cover"
                          src="https://placehold.co/32x32/B86BEB/FFFFFF?text=G"
                          alt="Avatar G"
                        />
                        <img
                          className="w-[40px] h-[40px] rounded-full border-2 border-white object-cover"
                          src="https://placehold.co/32x32/B86BEB/FFFFFF?text=G"
                          alt="Avatar G"
                        />
                      </div>
                    )}

                    <div
                      className={`flex w-[70%] leading-[24px] text4 flex-col items-start pr-6 ${
                        currentSlideContent.showAvatars ? "ml-12" : "ml-0"
                      } h-12 justify-center`}
                    >
                      {currentSlideContent.showStars && (
                        <div className="flex items-center text-yellow-400 space-x-0.5 mb-1">
                          <Star className="w-[18px] h-5 text-yellow-400 fill-yellow-400" />
                          <Star className="w-[18px] h-5 text-yellow-400 fill-yellow-400" />
                          <Star className="w-[18px] h-5 text-yellow-400 fill-yellow-400" />
                          <Star className="w-[18px] h-5 text-yellow-400 fill-yellow-400" />
                          <StarHalf className="w-[18px] h-5 text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                      {currentSlideContent.usersText}
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <div className="pl-[100px] mt-[70px]">
                <button
                  type="button"
                  className="bg-red hover:bg-red-600 text-white px-8 py-4 rounded-[10px] font-bold text-[15px] cursor-pointer h-[45px] transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>Descargar App</span>
                  <span>→</span>
                </button>
                <a href="#" className="text-sm text-[14px] text4 mt-3 block">
                  O empezá con tu negocio
                </a>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border-[#E5A657] border-4">
                <img
                  src={currentSlideContent.image}
                  alt="Restaurante"
                  className="w-full h-[345px] object-cover transition-opacity duration-500 ease-in-out"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-[100px] px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 w-[80%] mx-auto gap-[70px]">
            {/* Feature 1 */}
            <div className="flex space-x-6 md:items-start md:text-left">
              <div className="w-[50px] h-[50px] bg-red rounded-full flex items-center justify-center flex-shrink-0">
                <Utensils className="text-white w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[18px] Arvo-Bold text-black">
                  Exploración de locales
                </h3>
                <p className="text4 text-L2">
                  Descubrí restaurantes, cafés y bares que combinan con tu
                  estilo personal. DualEat te permite filtrar por tipo de
                  comida, ambiente y valoraciones reales.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex space-x-6 md:items-start md:text-left">
              <div className="w-[50px] h-[50px] bg-red rounded-full flex items-center justify-center flex-shrink-0">
                <Home className="text-white w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[18px] Arvo-Bold text-black">
                  Modo casero interactivo
                </h3>
                <p className="text4 text-L2">
                  Cociná como un chef desde la comodidad de tu casa. Accedé a
                  recetas detalladas con instrucciones paso a paso y descubrí
                  datos nutricionales.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex space-x-6 md:items-start md:text-left">
              <div className="w-[50px] h-[50px] bg-red rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="text-white w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[18px] Arvo-Bold text-black">
                  Gamificación y comunidad
                </h3>
                <p className="text4 text-L2">
                  Ganá puntos con tus aventuras gastronómicas en un juego. Gana
                  insignias, visitá nuevos lugares locales y dejá reseñas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section with Carousel */}
      <section className="bgCarousel py-[130px] px-4 border-t-2 border-b-2 border-[#E5A657]">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[30px] Arvo-Bold text3 mb-4">
              Una experiencia pensada para cada momento gastronómico
            </h2>
            <p className="text-[17px] text4 mx-auto">
              Descubre las diferentes funcionalidades que aporta DualEat, ya
              seas cliente o negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3  gap-[40px]  max-w-[80%] mx-auto">
            <div className="flex flex-col text1 gap-5 justify-between hover:scale-102 transition-all duration-500 ease-in-out">
              <div className="border border-[#E5A657] flex flex-col gap-8 py-4 px-6 rounded-[10px]">
                <p className="text5 text-[13px]">
                  Viví una experiencia gastronómica completa. Encontrá opciones
                  según tus gustos, dejá reseñas y descubrí nuevos sabores cada
                  día, todo desde una misma plataforma.
                </p>
                <h3 className="text-[26px] text-yellow underline Arvo-Bold">
                  Comer afuera
                </h3>
              </div>
              <div className="">
                <img
                  src={FOOD}
                  alt="Comer afuera"
                  className="w-full h-[345px] rounded-[10px] brightness-80 object-cover transition-opacity duration-500 ease-in-out"
                />
              </div>
            </div>

            <div className="w-full h-full bg-[#E5A657] human rounded-[10px] hover:scale-102 transition-all duration-500 ease-in-out">
              <h1 className="text-[22px] lg:text-[28px] underline text2 Arvo-Bold absolute top-0 left-[15%] pt-10 ps-5">
                Cocinar en casa
              </h1>
              <p className="text2 text-[13px] mt-4 absolute bottom-0 right-0 pb-10 pe-8 text-right max-w-[90%]">
                Explorá un mundo de recetas caseras paso a paso. Filtrá por
                ingredientes o tiempo de cocción. Compartí tus creaciones con la
                comunidad, desbloqueá logros y acumulá puntos mientras disfrutás
                de cocinar en casa.
              </p>
            </div>

            <div className="flex flex-col-reverse text1 gap-5 justify-between hover:scale-102 transition-all duration-500 ease-in-out">
              <div className="border border-[#b53325] flex flex-col gap-8 py-4 px-6 rounded-[10px]">
                <p className="text5 text-[13px]">
                  Transformá tu negocio gastronómico: creá tu menú digital de
                  forma rápida, respondé reseñas en tiempo real, promocioná tus
                  platos destacados y ganá presencia entre miles de foodies que
                  buscan nuevas experiencias.
                </p>
                <h3 className="text-[26px] text-red underline Arvo-Bold">
                  Para negocios
                </h3>
              </div>
              <div className="">
                <img
                  src={BUSINESS}
                  alt="Comer afuera"
                  className="w-full h-[345px] brightness-80 rounded-[10px] object-cover transition-opacity duration-500 ease-in-out"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Features Section */}
      <section className="bgLanding pt-[140px] pb-[80px]">
        <div className="flex justify-around max-w-[1400px] mx-auto">
          {/* Left Content */}
          <div className="space-y-6 w-[40%]">
            <h2 className="text-[32px] font-bold text-gray-900 leading-tight">
              Haz que tu local brille
            </h2>
            <p className="text4 text-[16px] max-w-[500px] leading-[26px]">
              DualEat está desarrollado con tecnología moderna y escalable,
              pensada para acompañarte en cada momento de tu experiencia
              gastronómica.
            </p>

            <div className="space-y-4 pt-6 text-[15px]">
              <div className="flex items-center space-x-4">
                <img
                  width="30"
                  height="48"
                  src="https://img.icons8.com/color/48/argentina.png"
                  alt="argentina"
                /> 
                <span className="text4">Disponible en todo el país</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center">
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="40"
                    height="40"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#7cb342"
                      d="M12 29c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V29zM40 29c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V29zM22 40c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V40zM30 40c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V40z"
                    ></path>
                    <path
                      fill="#7cb342"
                      d="M14 18v15c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V18H14zM24 8c-6 0-9.7 3.6-10 8h20C33.7 11.6 30 8 24 8zM20 13.6c-.6 0-1-.4-1-1 0-.6.4-1 1-1s1 .4 1 1C21 13.1 20.6 13.6 20 13.6zM28 13.6c-.6 0-1-.4-1-1 0-.6.4-1 1-1s1 .4 1 1C29 13.1 28.6 13.6 28 13.6z"
                    ></path>
                    <path
                      fill="#7cb342"
                      d="M28.3 10.5c-.2 0-.4-.1-.6-.2-.5-.3-.6-.9-.3-1.4l1.7-2.5c.3-.5.9-.6 1.4-.3.5.3.6.9.3 1.4l-1.7 2.5C29 10.3 28.7 10.5 28.3 10.5zM19.3 10.1c-.3 0-.7-.2-.8-.5l-1.3-2.1c-.3-.5-.2-1.1.3-1.4.5-.3 1.1-.2 1.4.3l1.3 2.1c.3.5.2 1.1-.3 1.4C19.7 10 19.5 10.1 19.3 10.1z"
                    ></path>
                  </svg>
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="30"
                    height="30"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#1e88e5"
                      d="M40.69,35.42c-9.15,11.88-21.41,8.8-26.23,6.1 c-7.35-4.11-12.5-13.68-9.44-23.25c0.9-2.82,2.27-5.23,3.98-7.23c1.67,0.13,3.65,0.13,6-0.04c14-1,18,11,17,14 c-0.51,1.53-2.32,2.02-3.97,2.13c0.16-0.22,0.36-0.54,0.64-1.02c0.87-1.54,0.98-4.49-1.73-6.27c-2.61-1.7-5.43-0.65-6.88,1.28 c-1.45,1.92-0.88,4.81-0.37,6.09c2.2,5.52,6.26,6.95,9.02,7.78c2.76,0.83,6.86,0.71,9.05-0.19c2.18-0.91,2.8-1.43,3.22-0.97 C41.41,34.29,41.11,34.82,40.69,35.42z"
                    ></path>
                    <path
                      fill="#0d47a1"
                      d="M40.732,35.42c-3.48,4.52-7.41,6.87-11.21,7.91 c-0.03,0.01-0.06,0.01-0.08,0.02c-2.2,0.42-3.95,0.08-5.85-0.29c-3.09-0.6-7.35-4.01-8.38-10.18c-0.88-5.31,1.63-9.81,5.59-12.54 c-0.26,0.24-0.49,0.5-0.7,0.78c-1.45,1.92-0.88,4.81-0.37,6.09c2.2,5.52,6.26,6.95,9.02,7.78c2.76,0.83,6.86,0.71,9.05-0.19 c2.18-0.91,2.8-1.43,3.22-0.97C41.452,34.29,41.152,34.82,40.732,35.42z"
                    ></path>
                    <path
                      fill="#00e5ff"
                      d="M26.94,4.25c0.02,0.26,0.03,0.54,0.03,0.81c0,3.78-1.75,7.14-4.48,9.32 c-1.02-0.52-2.21-0.94-3.65-1.22c-4.07-0.78-10.63,1.1-13.3,5.77c-0.88,1.53-1.25,3.1-1.41,4.55c0.04-1.71,0.33-3.46,0.89-5.21 C8.31,8.01,17.86,3.05,26.94,4.25z"
                    ></path>
                    <path
                      fill="#00e676"
                      d="M41.4,27.89c-2.76,2.78-6.27,2.86-8.67,2.73 c-2.41-0.12-3.59-0.82-4.69-1.5c-1.11-0.69-0.48-1.37-0.37-1.52c0.11-0.15,0.38-0.41,1-1.49c0.29-0.51,0.5-1.18,0.54-1.91 c4.62-3.43,7.96-8.49,9.16-14.34c2.92,2.95,4.3,6.21,4.79,7.61C44.04,19.99,44.71,24.56,41.4,27.89z"
                    ></path>
                    <path
                      fill="#1de9b6"
                      d="M38.37,9.85v0.01c-1.2,5.85-4.54,10.91-9.16,14.34c0.03-0.42,0-0.87-0.1-1.32 c0-0.02-0.01-0.04-0.01-0.05c-0.25-1.47-0.99-3.33-2.22-4.77c-1.22-1.44-2.52-2.73-4.39-3.68c2.73-2.18,4.48-5.54,4.48-9.32 c0-0.27-0.01-0.55-0.03-0.81c0.4,0.05,0.79,0.11,1.19,0.19C32.74,5.33,36.04,7.49,38.37,9.85z"
                    ></path>
                  </svg>
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="30"
                    height="30"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#4caf50"
                      d="M44,24c0,11.044-8.956,20-20,20S4,35.044,4,24S12.956,4,24,4S44,12.956,44,24z"
                    ></path>
                    <path
                      fill="#ffc107"
                      d="M24,4v20l8,4l-8.843,16c0.317,0,0.526,0,0.843,0c11.053,0,20-8.947,20-20S35.053,4,24,4z"
                    ></path>
                    <path
                      fill="#4caf50"
                      d="M44,24c0,11.044-8.956,20-20,20S4,35.044,4,24S12.956,4,24,4S44,12.956,44,24z"
                    ></path>
                    <path
                      fill="#ffc107"
                      d="M24,4v20l8,4l-8.843,16c0.317,0,0.526,0,0.843,0c11.053,0,20-8.947,20-20S35.053,4,24,4z"
                    ></path>
                    <path
                      fill="#f44336"
                      d="M41.84,15H24v13l-3-1L7.16,13.26H7.14C10.68,7.69,16.91,4,24,4C31.8,4,38.55,8.48,41.84,15z"
                    ></path>
                    <path
                      fill="#dd2c00"
                      d="M7.158,13.264l8.843,14.862L21,27L7.158,13.264z"
                    ></path>
                    <path
                      fill="#558b2f"
                      d="M23.157,44l8.934-16.059L28,25L23.157,44z"
                    ></path>
                    <path
                      fill="#f9a825"
                      d="M41.865,15H24l-1.579,4.58L41.865,15z"
                    ></path>
                    <path
                      fill="#fff"
                      d="M33,24c0,4.969-4.031,9-9,9s-9-4.031-9-9s4.031-9,9-9S33,19.031,33,24z"
                    ></path>
                    <path
                      fill="#2196f3"
                      d="M31,24c0,3.867-3.133,7-7,7s-7-3.133-7-7s3.133-7,7-7S31,20.133,31,24z"
                    ></path>
                  </svg>
                </div>
                <span className="text4">
                  Funciona en Android y Web
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center">
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="30"
                    height="30"
                    viewBox="0 0 48 48"
                  >
                    <polygon
                      fill="#546e7a"
                      points="21.906,31.772 24.507,29.048 27.107,31.772 27.107,43 21.906,43"
                    ></polygon>
                    <polygon
                      fill="#f50057"
                      points="17.737,29.058 21.442,28.383 21.945,32.115 15.345,41.199 11.138,38.141"
                    ></polygon>
                    <polygon
                      fill="#d500f9"
                      points="15.962,24.409 19.355,26.041 17.569,29.356 6.89,32.825 5.283,27.879"
                    ></polygon>
                    <polygon
                      fill="#29b6f6"
                      points="17.256,19.607 19.042,22.922 15.649,24.554 4.97,21.084 6.577,16.137"
                    ></polygon>
                    <polygon
                      fill="#00e5ff"
                      points="21.126,16.482 20.623,20.214 16.918,19.539 10.318,10.455 14.526,7.398"
                    ></polygon>
                    <polygon
                      fill="#546e7a"
                      points="26.094,16.228 23.493,18.952 20.893,16.228 20.893,5 26.094,5"
                    ></polygon>
                    <polygon
                      fill="#f50057"
                      points="30.262,18.943 26.558,19.618 26.055,15.886 32.654,6.802 36.862,9.859"
                    ></polygon>
                    <polygon
                      fill="#d500f9"
                      points="32.039,23.59 28.645,21.958 30.431,18.643 41.11,15.174 42.717,20.12"
                    ></polygon>
                    <polygon
                      fill="#29b6f6"
                      points="30.744,28.393 28.958,25.078 32.351,23.447 43.03,26.916 41.423,31.863"
                    ></polygon>
                    <polygon
                      fill="#00e5ff"
                      points="26.874,31.518 27.378,27.786 31.082,28.461 37.682,37.545 33.474,40.602"
                    ></polygon>
                  </svg>
                </div>
                <span className="text4">
                  Seguridad de datos y autenticación cifrada
                </span>
              </div>
            </div>
          </div>

          {/* Right Features */}
          <div className="space-y-6">
            {businessFeatures.map((feature, index) => {
              const isActive =
                hoveredFeature !== null
                  ? hoveredFeature === index
                  : currentFeatureSlide === index;

              return (
                <div
                  key={index}
                  className="bg-white p-6 overflow-hidden max-h-[200px] max-w-[700px] rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div
                    className="flex-col flex items-start space-x-4"
                    onMouseEnter={() => {
                      setHoveredFeature(index);
                      setCurrentFeatureSlide(index);
                    }}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div>{feature.icon}</div>

                      <h3 className="text-[17px] text5 Arvo-Bold">
                        {feature.title}
                      </h3>
                      <span className="px-2 py-1 bg-yellow text1 text-xs rounded-full ">
                        {feature.badge}
                      </span>
                    </div>

                    {isActive && (
                      <>
                        <p className="text4 text-[15px] leading-6">
                          {feature.subtitle}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden mt-[150px]">
          <DownloadSectionBG
            background="bg-gradient-to-b from-[#232526] to-[#414345]"
            background2="bg-yellow"
          />
        </div>
      </section>
    </div>
  );
};

export default LandingHome;
