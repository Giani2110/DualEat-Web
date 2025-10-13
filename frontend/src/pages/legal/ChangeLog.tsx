import React from "react";
import DownloadSectionBG from "../../components/shared/DownloadSectionBG";

const ChangeLog: React.FC = () => {
  return (
    <div className="min-h-screen bgsemi-white pt-[15px]">
      <div className="rounded-[20px] mx-4 bg-gradient-to-t from-[#000000] to-[#434343] text-white h-[400px] relative">
        <div className="max-w-screen-2xl mx-auto text-center pt-[160px]">
          <h1 className="text-[48px] Dosis-Bold mb-4">Changelog</h1>
          <p className="text-[18px] max-w-2xl mx-auto leading-[32px] tracking-[-0.3px]">
            Historial de cambios realizados a lo largo del sistema de DualEat
          </p>
        </div>
      </div>
      {/* Main Content */}
      <main className="mx-4 mt-4">
        <div className="bg-gray py-[70px] px-8 rounded-[20px]">
          {/* Entry 1 */}
          <div className="pb-8 pt-8 border-b border-gray-200 max-w-[55%] mx-auto">
            <h2 className="text-[15px] text4">12 de julio de 2025</h2>

            <h3 className="titleCL Dosis-Bold mb-1 mt-3">
              Menús digitales más visuales
            </h3>
            <p className="text6 textCL">
              Los locales ahora pueden incluir imágenes de sus platos en el
              menú. Esto mejora la experiencia del cliente al elegir qué pedir.
            </p>
            <h3 className="titleCL Dosis-Bold mb-1 mt-3">
              Mejoras de seguridad en el inicio de sesión
            </h3>
            <p className="text6 textCL">
              Agregamos autenticación por Magic Link. También reforzamos
              validaciones al crear cuenta para evitar registros fraudulentos.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400">
                    ✉️
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">
                    👁️
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Repetir contraseña"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">
                    👁️
                  </span>
                </div>
              </div>
            </div>
            <h3 className="titleCL Dosis-Bold mb-1 mt-3">Otras mejoras</h3>
            <ul className="list-disc pl-6 space-y-2 text6 textCL">
              <li>
                Las recetas pueden compartirse fácilmente por WhatsApp o redes
                sociales.
              </li>
              <li>Mejora en la visualización de precios con descuentos.</li>
            </ul>
          </div>

          {/* Entry 2 */}
          <div className="pt-8 pb-8 border-b border-gray-200 max-w-[55%] mx-auto">
            <h2 className="text-[15px] text4">27 de junio de 2025</h2>

            <h3 className="titleCL Dosis-Bold mb-1 mt-3">
              Incorporamos filtros por tipo de comida
            </h3>
            <p className="text6 textCL">
              Ahora podés buscar restaurantes y recetas según tu estilo
              alimentario: vegano, sin TACC, bajo en calorías y más. Seguimos
              sumando nuevas categorías.
            </p>
            <h3 className="titleCL Dosis-Bold mb-1 mt-3">
              Mejora en escaneo QR dentro de locales
            </h3>
            <p className="text6 textCL">
              El escaneo QR ahora carga el menú más rápido y permite dejar
              reseñas al instante. También suma puntos automáticamente al perfil
              del cliente.
            </p>
            <h3 className="titleCL Dosis-Bold mb-1 mt-3">
              Otras mejoras y correcciones
            </h3>
            <ul className="list-disc pl-6 space-y-2 text6 textCL">
              <li>
                Se corrigió un error que impedía guardar ingredientes
                frecuentes.
              </li>
              <li>
                Las notificaciones push ahora se adaptan a tu horario habitual
                de uso.
              </li>
              <li>
                Optimizamos el rendimiento general en celulares de gama
                media/baja.
              </li>
            </ul>
          </div>
        </div>
      </main>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden mt-10 mb-10">
        <DownloadSectionBG
          background="bg-gradient-to-b from-[#ED213A] to-[#93291E]"
          background2="bg-red"
        />
      </div>
    </div>
  );
};

export default ChangeLog;
