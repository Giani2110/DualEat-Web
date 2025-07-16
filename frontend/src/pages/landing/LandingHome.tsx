import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DownloadSectionBG from '../../components/DownloadSectionBG';
import Restaurante1 from '../../assets/images/login/Restaurante2.avif';
import Restaurante2 from '../../assets/images/login/Restaurante.avif';
import AR from '../../assets/images/landing/AR.jpg';
import { Utensils, Home, Trophy, Star, StarHalf, ChevronUp, ChevronDown, MapPin, Shield, Zap, Users, Smartphone } from 'lucide-react';

const LandingHome: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentFeatureSlide, setCurrentFeatureSlide] = useState(0);

    const slides = [
        {
            title: (
                <>
                    <span className="italic underline decoration-red-500">Descubrí</span> lugares que<br />
                    reflejan tus <span className="italic underline decoration-red-500">gustos</span>
                </>
            ),
            description: (
                <>
                    DualEat te conecta con <span className="font-semibold">experiencias gastronómicas únicas</span>,
                    ya sea en tu ciudad o en casa. Comé mejor, cocina distinto,
                    compartí tu pasión.
                </>
            ),
            image: Restaurante1,
            usersText: (
                <span className="text-sm text-gray-600">
                    <span className="font-semibold">+500</span> usuarios registrados que
                    buscan una verdadera experiencia
                    gastronómica
                </span>
            ),
            showStars: true,
            showAvatars: true
        },
        {
            title: (
                <>
                    <span className="italic underline decoration-red-500">Tu negocio</span> en<br />
                    <span className="italic underline decoration-red-500">crecimiento</span> constante
                </>
            ),
            description: (
                <>
                    Potencia tu <span className="font-semibold">restaurante</span> con DualEat.
                    Alcanza nuevos clientes, gestiona tu menú y utiliza nuestro dashboard para ver todas las estadísticas de tu negocio.
                </>
            ),
            image: Restaurante2,
            usersText: (
                <span className="text-sm text-gray-600">
                    <span className="font-semibold">+100</span> negocios asociados en nuestra plataforma.
                </span>
            ),
            showStars: false,
            showAvatars: false
        }
    ];

    const experienceSlides = [
        {
            title: "Comer afuera",
            subtitle: "Descubre locales, escaneá QR, descubrí platos y acumulá puntos con cada visita.",
            icon: <Utensils className="w-8 h-8 text-white" />,
            color: "bg-red-500",
            dotColor: "bg-red-500"
        },
        {
            title: "Cocinar en casa",
            subtitle: "Accedé a recetas, seguí los pasos, gana logros y compartí tus platos favoritos.",
            icon: <Home className="w-8 h-8 text-white" />,
            color: "bg-orange-500",
            dotColor: "bg-orange-500"
        },
        {
            title: "Para negocios",
            subtitle: "Digitalizá tu carta, gestioná reseñas y potenciá tu visibilidad en la comunidad foodie.",
            icon: <Trophy className="w-8 h-8 text-white" />,
            color: "bg-red-500",
            dotColor: "bg-red-500"
        },
        {
            title: "Comunidad",
            subtitle: "Súmate a una red de foodies, comparte experiencias y descubre nuevos sabores.",
            icon: <Users className="w-8 h-8 text-white" />,
            color: "bg-orange-500",
            dotColor: "bg-orange-500"
        }
    ];

    const businessFeatures = [
        {
            title: "Accesible desde cualquier lugar",
            subtitle: "Tu DualEat está disponible desde tu teléfono, tablet o computadora, ofreciendo flexibilidad total para gestionar tu negocio desde donde estés.",
            icon: <MapPin className="w-6 h-6 text-orange-500" />,
            badge: "Web"
        },
        {
            title: "Seguridad y privacidad de tus datos",
            subtitle: "Protegemos tu información con los más altos estándares de seguridad y cifrado, garantizando que tus datos estén siempre seguros.",
            icon: <Shield className="w-6 h-6 text-orange-500" />,
            badge: "Seguro"
        },
        {
            title: "Listo para escalar contigo",
            subtitle: "Nuestra plataforma crece junto a tu negocio, adaptándose a tus necesidades sin límites de capacidad o funcionalidad.",
            icon: <Zap className="w-6 h-6 text-orange-500" />,
            badge: "Escalable"
        },
        {
            title: "Sencillos pasos",
            subtitle: "Configurá tu restaurante en minutos con nuestro proceso intuitivo y empezá a recibir clientes inmediatamente.",
            icon: <Smartphone className="w-6 h-6 text-orange-500" />,
            badge: "Fácil"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [slides.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeatureSlide((prevSlide) => (prevSlide + 1) % experienceSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [experienceSlides.length]);

    const handleNextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    };

    const handlePrevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
    };

    const handleFeatureSlide = (index: number) => {
        setCurrentFeatureSlide(index);
    };

    const currentSlideContent = slides[currentSlide];

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Header */}
            <div className="fixed top-0 left-0 w-full z-50">
                <div className="max-w-screen-2xl mx-auto mt-6 rounded-lg overflow-hidden shadow-lg">
                    <Header />
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white pt-32 pb-20 px-4 relative">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 relative">
                            {/* Navigation Arrows */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col space-y-4 items-center pl-4 pr-2">
                                <button
                                    onClick={handlePrevSlide}
                                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors duration-200"
                                    aria-label="Previous slide"
                                >
                                    <ChevronUp className="w-5 h-5" />
                                </button>
                                <div className="text-2xl font-bold text-gray-800">
                                    {currentSlide + 1}
                                </div>
                                <button
                                    onClick={handleNextSlide}
                                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors duration-200"
                                    aria-label="Next slide"
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6 pl-24">
                                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                    {currentSlideContent.title}
                                </h1>

                                <div className="max-w-lg">
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        {currentSlideContent.description}
                                    </p>

                                    {/* User avatars and stars/text */}
                                    <div className="flex items-center mb-4">
                                        {currentSlideContent.showAvatars && (
                                            <div className="flex -space-x-2">
                                                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://placehold.co/32x32/FF6B6B/FFFFFF?text=A" alt="Avatar A" />
                                                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://placehold.co/32x32/6B8EFF/FFFFFF?text=J" alt="Avatar J" />
                                                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://placehold.co/32x32/6BEB6B/FFFFFF?text=P" alt="Avatar P" />
                                                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://placehold.co/32x32/EBEB6B/FFFFFF?text=M" alt="Avatar M" />
                                                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://placehold.co/32x32/B86BEB/FFFFFF?text=G" alt="Avatar G" />
                                            </div>
                                        )}
                                        
                                        <div className={`flex flex-col items-start pr-6 ${currentSlideContent.showAvatars ? 'ml-12' : 'ml-0'} h-12 justify-center`}>
                                            {currentSlideContent.showStars && (
                                                <div className="flex items-center text-yellow-400 space-x-0.5">
                                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                                    <StarHalf className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                                </div>
                                            )}
                                            {currentSlideContent.usersText}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Download Button */}
                            <div className="pl-24">
                                <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center space-x-2">
                                    <span>Descargar App</span>
                                    <span>→</span>
                                </button>
                                <p className="text-sm text-gray-500 mt-2">O <a href="#" className="text-red-500 hover:underline">Empezá con tu negocio</a></p>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="relative">
                            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                                <img
                                    src={currentSlideContent.image}
                                    alt="Restaurante"
                                    className="w-full h-96 lg:h-[500px] object-cover transition-opacity duration-500 ease-in-out"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-50 py-20 px-4">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-center text-center space-y-4 md:items-start md:text-left">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Utensils className="text-white w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Exploración de locales</h3>
                            </div>
                            <p className="text-gray-600 pl-12">
                                Descubrí restaurantes cerca tuyo que
                                combinan con tu estilo personal.
                                DualEat te permite filtrar por tipo de comida,
                                ambiente y valoraciones reales.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col items-center text-center space-y-4 md:items-start md:text-left">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Home className="text-white w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Modo casero interactivo</h3>
                            </div>
                            <p className="text-gray-600 pl-12">
                                Cociná en casa con chef desde la comodidad
                                de tu casa.
                                Accedé a recetas detalladas con
                                instrucciones paso a paso y descargá
                                listas nutricionales.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col items-center text-center space-y-4 md:items-start md:text-left">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Trophy className="text-white w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Gamificación y comunidad</h3>
                            </div>
                            <p className="text-gray-600 pl-12">
                                Ganá puntos con tus aventuras
                                gastronómicas en un juego
                                Gana insignias, visitá nuevos lugares
                                locales y dejá reseñas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Experience Section with Carousel */}
            <div className="bg-white py-20 px-4">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Una experiencia pensada para cada momento gastronómico
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Descubre las diferentes funcionalidades que aporta DualEat, ya seas cliente o negocio.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {experienceSlides.map((slide, index) => (
                            <div 
                                key={index}
                                className={`p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                                    index === currentFeatureSlide 
                                        ? 'bg-gray-50 shadow-lg scale-105' 
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                                onClick={() => handleFeatureSlide(index)}
                            >
                                <div className="flex items-center mb-4">
                                    <div className={`w-12 h-12 ${slide.color} rounded-full flex items-center justify-center mr-4`}>
                                        {slide.icon}
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${slide.dotColor} ${
                                        index === currentFeatureSlide ? 'opacity-100' : 'opacity-30'
                                    }`}></div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{slide.title}</h3>
                                <p className="text-gray-600 text-sm">{slide.subtitle}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Business Features Section */}
            <div className="bg-gray-50 py-20 px-4">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                                    Haz que tu local brille
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    DualEat está desarrollado con tecnología moderna y escalable, 
                                    pensada para acompañarte en cada momento de tu experiencia 
                                    gastronómica.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-lg"><img src={AR} alt="Argentina" /></span>
                                    </div>
                                    <span className="text-gray-700 font-medium">Disponible en todo el país</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                        <Smartphone className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Funciona en Android y Web</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Seguridad de datos y autenticación cifrada</span>
                                </div>
                            </div>

                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200">
                                Únete a DualEat
                            </button>
                        </div>

                        {/* Right Features */}
                        <div className="space-y-6">
                            {businessFeatures.map((feature, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            {feature.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                                                <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                                                    {feature.badge}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm">{feature.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Download Section */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden mt-10 mb-10">
                <DownloadSectionBG />
            </div>

            <div className="h-10 bg-white"></div>

            <Footer />
        </div>
    );
};

export default LandingHome;