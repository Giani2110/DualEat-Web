import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DownloadSectionBG from '../../components/DownloadSectionBG';

const ChangeLog: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans"> {/* Changed overall background to white */}
            {/* Hero Section */}
            <div className="rounded-b-3xl bg-gradient-to-br from-red-600 via-red-500 to-red-400 text-white pt-20 pb-20 px-4 relative">
                <div className="fixed top-0 left-0 w-full z-50">
                    <div className="max-w-screen-2xl mx-auto mt-6 rounded-lg overflow-hidden shadow-lg">
                        <Header />
                    </div>
                </div>

                <div className="max-w-screen-2xl mx-auto text-center pt-24">
                    <h1 className="text-5xl font-extrabold mb-4">Changelog</h1>
                    <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                        Historial de cambios realizados a lo largo del sistema de DualEat
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 bg-[#F5F5F5] rounded-lg my-10 shadow-lg"> {/* Added F5F5F5 background and rounded corners */}
                <div className="space-y-12">
                    {/* Entry 1 */}
                    <div className="pb-8 border-b border-gray-200"> {/* Removed card styling, added bottom border */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">12 de julio de 2025</h2> {/* Date as main heading */}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Menús digitales más visuales</h3>
                        <p className="text-gray-700 mb-6">
                            Los locales ahora pueden incluir imágenes de sus platos en el menú. Esto mejora la
                            experiencia del cliente al elegir qué pedir.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Mejoras de seguridad en el inicio de sesión</h3>
                        <p className="text-gray-700 mb-4">
                            Agregamos autenticación por Magic Link. También reforzamos validaciones al
                            crear cuenta para evitar registros fraudulentos.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="tu@email.com"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                        <span className="absolute right-3 top-2.5 text-gray-400">✉️</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                        <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">👁️</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            placeholder="Repetir contraseña"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                        <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">👁️</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Otras mejoras</h3>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Las recetas pueden compartirse fácilmente por WhatsApp o redes sociales.</li>
                            <li>Mejora en la visualización de precios con descuentos.</li>
                        </ul>
                    </div>

                    {/* Entry 2 */}
                    <div className="pt-8"> {/* Removed card styling, added top padding */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">27 de junio de 2025</h2> {/* Date as main heading */}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Incorporamos filtros por tipo de comida</h3>
                        <p className="text-gray-700 mb-4">
                            Ahora podés buscar restaurantes y recetas según tu estilo alimentario: vegano, sin TACC, bajo en calorías y más. Seguimos sumando nuevas categorías.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Mejora en escaneo QR dentro de locales</h3>
                        <p className="text-gray-700 mb-4">
                            El escaneo QR ahora carga el menú más rápido y permite dejar reseñas al instante.
                            También suma puntos automáticamente al perfil del cliente.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Otras mejoras y correcciones</h3>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Se corrigió un error que impedía guardar ingredientes frecuentes.</li>
                            <li>Las notificaciones push ahora se adaptan a tu horario habitual de uso.</li>
                            <li>Optimizamos el rendimiento general en celulares de gama media/baja.</li>
                        </ul>
                    </div>
                </div>
            </main>

            {/* Download Section */}
            <div className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden mt-10 mb-10">
                <DownloadSectionBG />
            </div>

            <div className="h-10 bg-white"></div> {/* Changed background to white */}

            <Footer />
        </div>
    );
};

export default ChangeLog;