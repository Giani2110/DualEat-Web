import DownloadSectionBG from "@components/shared/DownloadSectionBG";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bgsemi-white pt-[15px]">
      {/* Banner Header */}
      <div className="rounded-[20px] mx-4 bg-gradient-to-t from-[#000000] to-[#434343] text-white h-[400px] relative">
        <div className="max-w-screen-2xl mx-auto text-center pt-[160px] px-4">
          <h1 className="text-[45px] md:text-[48px] Dosis-Bold mb-4 animate-fade-in">
            Términos y condiciones
          </h1>
          <p className="text-[17px] md:text-[18px] max-w-2xl mx-auto leading-[32px] tracking-[-0.3px]">
            Reglas y pautas para el uso del ecosistema digital de DualEat.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-4 mt-4">
        <div className="bg-gray py-[70px] px-8 rounded-[20px] min-h-[500px]">
          <div className="max-w-[70%] mx-auto pb-8 pt-8">

            {/* Header intro */}
            <div className="mb-12 border-b border-gray-300 pb-8">
              <p className="text-[14px] font-bold text-gray-500 mb-4 uppercase tracking-wider">
                Última actualización: Mayo 2026
              </p>
              <p className="text4 textTC leading-relaxed font-light">
                Bienvenido/a a <strong>DualEat</strong>, una plataforma digital
                diseñada para conectar personas con experiencias gastronómicas,
                tanto en locales físicos como desde casa. Al registrarte o
                utilizar nuestros servicios, aceptás estos Términos y Condiciones
                de uso.
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
              {/* Section 1 */}
              <section className="scroll-mt-24">
                <h2 className="Dosis-Bold text5 titleTC text-gray-900 border-l-4 border-black pl-3 mb-4">
                  1. Identificación
                </h2>
                <p className="text4 textTC text-gray-700 font-light leading-relaxed">
                  DualEat es un proyecto académico y comercial en desarrollo por
                  parte de Gianfranco Andreacchi y Axel Berger, operando
                  inicialmente dentro del territorio de la República Argentina.
                </p>
                <ul className="list-disc pl-6 text4 textTC text-gray-700 font-light space-y-2 mt-2">
                  <li>
                    Podés contactarnos a través de{" "}
                    <a
                      href="mailto:contacto@dualeat.app"
                      className="text-[#b53325] hover:underline font-bold"
                    >
                      contacto@dualeat.app
                    </a>
                  </li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="scroll-mt-24">
                <h2 className="Dosis-Bold text5 titleTC text-gray-900 border-l-4 border-black pl-3 mb-4">
                  2. Definiciones
                </h2>
                <div className="grid md:grid-cols-2 gap-6 text4 textTC text-gray-700 font-light leading-relaxed">
                  <div className="bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm">
                    <p className="mb-1">
                      <strong className="text-gray-900">Usuario:</strong>
                    </p>
                    <p className="text-sm">
                      Persona que utiliza la app para buscar locales gastronómicos, recetas o interactuar con otros usuarios.
                    </p>
                  </div>
                  <div className="bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm">
                    <p className="mb-1">
                      <strong className="text-gray-900">Local / Negocio:</strong>
                    </p>
                    <p className="text-sm">
                      Establecimiento gastronómico registrado que utiliza DualEat para mostrar su menú, promociones o gestionar interacciones con clientes.
                    </p>
                  </div>
                  <div className="bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm">
                    <p className="mb-1">
                      <strong className="text-gray-900">Plataforma:</strong>
                    </p>
                    <p className="text-sm">
                      Sitio web, app móvil o servicios digitales de DualEat.
                    </p>
                  </div>
                  <div className="bg-white/40 p-4 rounded-xl border border-white/50 shadow-sm">
                    <p className="mb-1">
                      <strong className="text-gray-900">Contenido:</strong>
                    </p>
                    <p className="text-sm">
                      Cualquier texto, imagen, receta, menú, comentario o dato subido por los usuarios o el equipo de DualEat.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="scroll-mt-24">
                <h2 className="Dosis-Bold text5 titleTC text-gray-900 border-l-4 border-black pl-3 mb-4">
                  3. Condiciones de uso
                </h2>
                <p className="text4 textTC text-gray-700 font-light leading-relaxed">
                  El uso de la plataforma implica el cumplimiento de estas reglas:
                </p>
                <ul className="list-disc pl-6 text4 textTC text-gray-700 font-light space-y-2 mt-2">
                  <li>
                    Debés tener al menos 16 años o usar la app bajo supervisión de un adulto responsable.
                  </li>
                  <li>
                    Está prohibido usar DualEat para fines ilegales, fraudulentos, abusivos o que atenten contra otros usuarios o terceros.
                  </li>
                  <li>
                    No está permitido subir contenido ofensivo, falso, engañoso o que viole derechos de autor.
                  </li>
                  <li>
                    DualEat se reserva el derecho a suspender cuentas o eliminar contenido que infrinja estas condiciones.
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="scroll-mt-24">
                <h2 className="Dosis-Bold text5 titleTC text-gray-900 border-l-4 border-black pl-3 mb-4">
                  4. Obligaciones de los locales gastronómicos
                </h2>
                <p className="text4 textTC text-gray-700 font-light leading-relaxed">
                  Si sos dueño o administrador de un local que utiliza DualEat, aceptás:
                </p>
                <ul className="list-disc pl-6 text4 textTC text-gray-700 font-light space-y-2 mt-2">
                  <li>
                    Subir información veraz, actualizada y clara (precios, menús, horarios).
                  </li>
                  <li>
                    Cumplir con las normativas locales de salubridad, atención y facturación.
                  </li>
                  <li>
                    No ofrecer productos ilegales, vencidos o que puedan afectar la salud de los consumidores.
                  </li>
                  <li>
                    DualEat no garantiza ni se responsabiliza por la calidad, cumplimiento o disponibilidad de tus productos ante los usuarios.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="scroll-mt-24">
                <h2 className="Dosis-Bold text5 titleTC text-gray-900 border-l-4 border-black pl-3 mb-4">
                  5. Propiedad intelectual
                </h2>
                <div className="space-y-4 text4 textTC text-gray-700 font-light leading-relaxed">
                  <p>
                    Todo el contenido original de la app (nombre, diseño, código, marca, textos, imágenes, funcionalidades) pertenece a DualEat y está protegido por leyes de propiedad intelectual.
                  </p>
                  <p>
                    El contenido que subís (reseñas, fotos, recetas) seguirá siendo tuyo, pero nos otorgás una licencia para mostrarlo dentro de la app y promocionar la plataforma, siempre respetando tus derechos.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section className="scroll-mt-24">
                <h2 className="Dosis-Bold text5 titleTC text-gray-900 border-l-4 border-black pl-3 mb-4">
                  6. Privacidad y datos personales
                </h2>
                <p className="text4 textTC text-gray-700 font-light leading-relaxed">
                  DualEat recopila ciertos datos personales para mejorar tu experiencia. Al usar nuestros servicios aceptás nuestra Política de Privacidad. Usamos tus datos de forma segura para:
                </p>
                <ul className="list-disc pl-6 text4 textTC text-gray-700 font-light space-y-2 mt-2">
                  <li>Sugerencias personalizadas y estadísticas de uso.</li>
                  <li>Comunicación y notificaciones de sistema.</li>
                  <li>Ofertas y promociones gastronómicas relacionadas.</li>
                </ul>
                <p className="text4 textTC text-gray-700 font-light mt-3">
                  No vendemos ni alquilamos tus datos a terceros.
                </p>
              </section>

              {/* Section 7 */}
              <section className="scroll-mt-24">
                <h2 className="Dosis-Bold text5 titleTC text-gray-900 border-l-4 border-black pl-3 mb-4">
                  7. Limitación de responsabilidad
                </h2>
                <ul className="list-disc pl-6 text4 textTC text-gray-700 font-light space-y-2">
                  <li>
                    DualEat no es responsable por errores en los menús, calidad de los productos ofrecidos, retrasos, alergias alimentarias o inconvenientes con los locales.
                  </li>
                  <li>
                    Tampoco garantiza disponibilidad permanente del servicio, aunque trabajamos para minimizar interrupciones.
                  </li>
                  <li>
                    Las interacciones entre usuarios y locales son responsabilidad exclusiva de las partes involucradas.
                  </li>
                </ul>
              </section>

              {/* Section 8 */}
              <section className="scroll-mt-24">
                <h2 className="Dosis-Bold text5 titleTC text-gray-900 border-l-4 border-black pl-3 mb-4">
                  8. Cambios en los términos
                </h2>
                <p className="text4 textTC text-gray-700 font-light leading-relaxed">
                  Nos reservamos el derecho de modificar estos Términos en cualquier momento. Notificaremos los cambios de forma visible. El uso continuo de la app implica que aceptás las condiciones actualizadas.
                </p>
                <p className="text4 textTC text-gray-700 font-light leading-relaxed mt-3">
                  Estos Términos se rigen por las leyes de la República Argentina. En caso de disputa, los conflictos serán resueltos por los tribunales ordinarios con jurisdicción en la Ciudad Autónoma de Buenos Aires.
                </p>
              </section>
            </div>

          </div>
        </div>
      </main>

      {/* Download Section */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden mt-10 mb-10">
        <DownloadSectionBG
          background="bg-gradient-to-b from-[#ED213A] to-[#93291E]"
          background2="bg-red"
        />
      </div>
    </div>
  );
};

export default TermsConditions;
