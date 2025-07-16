import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DownloadSectionBG from '../../components/DownloadSectionBG';

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Hero Section */}
            <div className="rounded-b-3xl bg-gradient-to-br from-red-600 via-red-500 to-red-400 text-white pt-20 pb-20 px-4 relative">
                <div className="fixed top-0 left-0 w-full z-50">
                    <div className="max-w-screen-2xl mx-auto mt-6 rounded-lg overflow-hidden shadow-lg">
                        <Header />
                    </div>
                </div>

                <div className="max-w-screen-2xl mx-auto text-center pt-24">
                    <h1 className="text-5xl font-extrabold mb-4">Sobre nosotros</h1>
                    <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                        Apasionados por la comida, la tecnología y las experiencias
                        simples pero memorables.
                    </p>
                </div>
            </div>

            {/* Main Content */}

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

                {/* Principles Section */}
                <div className="bg-[#F5F5F5] py-16 px-8 mb-10 rounded-lg">
                    <div className="mx-auto">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-16 text-left">
                            Nuestros principios
                        </h2>

                        <div className="grid lg:grid-cols-2 gap-x-20 gap-y-12">
                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        Diseñar con foco en las personas, negocios, foodies y cocineros caseros
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        Pensamos en cada tipo de usuario: foodies, clientes y
                                        cocineros caseros. Cada función está hecha para
                                        resolver necesidades reales y mejorar la experiencia.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        Ser inclusivos y accesibles
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        Diseñamos una plataforma pensada para todos, fácil
                                        de usar, adaptable a distintos perfiles, dietas, edades y
                                        necesidades.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        Priorizar lo que aporta valor
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        Evitamos saturar con funciones innecesarias. Solo
                                        implementamos herramientas útiles, simples y
                                        relevantes para el día a día.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        Impulsar a los negocios gastronómicos
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        Buscamos que los locales crezcan de forma
                                        sostenible, brindándoles visibilidad, estadísticas y
                                        herramientas simples para fidelizar clientes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-10 bg-white"></div>

                {/* Vision and Mission Section */}
                <div className="bg-[#F5F5F5] py-16 px-8 rounded-lg">
                    <div className="mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16">
                            {/* Vision */}
                            <div>
                                <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-left">Visión</h2>
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    Ser la aplicación gastronómica líder en conectar
                                    experiencias culinarias tanto en locales como en el
                                    hogar, transformando la forma en que las personas
                                    descubren, ordenan y comparten comida en
                                    Latinoamérica.
                                </p>
                            </div>

                            {/* Mission */}
                            <div className="lg:text-right">
                                <h2 className="text-4xl font-extrabold text-gray-900 mb-6 lg:ml-auto">Misión</h2>
                                <p className="text-gray-700 leading-relaxed text-lg lg:ml-auto">
                                    Brindar una plataforma integral que permita a los
                                    negocios gastronómicos y cocineros a los amantes de la
                                    cocina, facilitando la tecnología, comunidad y
                                    gamificación para hacer de cada comida una experiencia
                                    personalizada, accesible y memorable.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Download Section */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden mt-10 mb-10">
                <DownloadSectionBG />
            </div>

            <div className="h-10 bg-white"></div>

            <Footer />
        </div>
    );
};

export default AboutUs;