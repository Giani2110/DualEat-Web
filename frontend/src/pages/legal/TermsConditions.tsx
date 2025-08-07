import React from "react";
import DownloadSectionBG from "../../components/DownloadSectionBG";

const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[200px] pb-[100px]">
        <div className="bgsemi-white rounded-[20px] shadow-sm border-3 border-white p-8 md:p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl Arvo-Bold mb-4">
              Términos y condiciones
            </h1>
            <p className="text5">
              <strong>Última actualización:</strong> Julio 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text4 textTC mb-10!">
              Bienvenido/a a <strong>DualEat</strong>, una plataforma digital
              diseñada para conectar personas con experiencias gastronómicas,
              tanto en locales físicos como desde casa. Al registrarte o
              utilizar nuestros servicios, aceptás estos Términos y Condiciones
              de uso.
            </p>

            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="Arvo-Bold text5 titleTC">
                1. Identificación
              </h2>
              <p className="text4 textTC">
                DualEat es un proyecto académico y comercial en desarrollo por
                parte de Gianfranco Andreacchi y Axel Berger, operando
                inicialmente dentro del territorio de la República Argentina.
              </p>
              <ul className="list-disc pl-6 text4 textTC space-y-2">
                <li>
                  Podés contactarnos a través de{" "}
                  <a
                    href="mailto:contacto@dualeat.app"
                    className="text-[#0a87da] cursor-pointer hover:underline"
                  >
                    contacto@dualeat.app
                  </a>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="Arvo-Bold text5 titleTC">
                2. Definiciones
              </h2>
              <div className="space-y-4 text4 textTC">
                <div>
                  <p>
                    <strong>Usuario:</strong> Persona que utiliza la app para
                    buscar locales gastronómicos, recetas o interactuar con
                    otros usuarios.
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Local/Negocio:</strong> Establecimiento gastronómico
                    registrado que utiliza DualEat para mostrar su menú,
                    promociones o gestionar interacciones con clientes.
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Plataforma:</strong> Sitio web, app móvil o
                    servicios digitales de DualEat.
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Contenido:</strong> Cualquier texto, imagen, receta,
                    menú, comentario o dato subido por los usuarios o el equipo
                    de DualEat.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2 className="Arvo-Bold text5 titleTC">
                3. Condiciones de uso
              </h2>
              <p className="text4 textTC">
                El uso de la plataforma implica el cumplimiento de estas reglas:
              </p>
              <ul className="list-disc pl-6 text4 textTC space-y-2">
                <li>
                  Debés tener al menos 16 años o usar la app bajo supervisión de
                  un adulto responsable.
                </li>
                <li>
                  Está prohibido usar DualEat para fines ilegales, fraudulentos,
                  abusivos o que atenten contra otros usuarios o terceros.
                </li>
                <li>
                  No está permitido subir contenido ofensivo, falso, engañoso o
                  que viole derechos de autor.
                </li>
                <li>
                  DualEat se reserva el derecho a suspender cuentas o eliminar
                  contenido que infrinja estas condiciones.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-10! text4 textTC">
              <h2 className="Arvo-Bold text5 titleTC">
                4. Obligaciones de los locales gastronómicos
              </h2>
              <p>
                Si sos dueño o administrador de un local que utiliza DualEat,
                aceptás:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Subir información veraz, actualizada y clara (precios, menús,
                  horarios).
                </li>
                <li>
                  Cumplir con las normativas locales de salubridad, atención y
                  facturación.
                </li>
                <li>
                  No ofrecer productos ilegales, vencidos o que puedan afectar
                  la salud de los consumidores.
                </li>
                <li>
                  DualEat no garantiza ni se responsabiliza por la calidad,
                  cumplimiento o disponibilidad de tus productos ante los
                  usuarios.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-10! text4 textTC">
              <h2 className="Arvo-Bold text5 titleTC">
                5. Propiedad intelectual
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="">
                    Todo el contenido original de la app (nombre, diseño,
                    código, marca, textos, imágenes, funcionalidades) pertenece
                    a DualEat y está protegido por leyes de propiedad
                    intelectual.
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    El contenido que subís (reseñas, fotos, recetas) seguirá
                    siendo tuyo, pero nos otorgás una licencia para mostrarlo
                    dentro de la app y promocionar la plataforma, siempre
                    respetando tus derechos.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-10! text4 textTC ">
              <h2 className="Arvo-Bold text5 titleTC">
                6. Privacidad y datos personales
              </h2>
              <p>
                DualEat recopila ciertos datos personales para mejorar tu
                experiencia. Al usar nuestros servicios aceptás nuestra Política
                de Privacidad.
              </p>
              <p>
                Usamos tus datos de forma segura para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sugerencias personalizadas.</li>
                <li>Estadísticas de uso.</li>
                <li>Comunicación y notificaciones.</li>
                <li>Ofertas y promociones relacionadas.</li>
              </ul>
              <p className="mt-4">
                No vendemos tus datos a terceros.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-10! text4 textTC">
              <h2 className="Arvo-Bold text5 titleTC">
                7. Limitación de responsabilidad
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  DualEat no es responsable por errores en los menús, calidad de
                  los productos ofrecidos, retrasos, alergias alimentarias o
                  inconvenientes con los locales.
                </li>
                <li>
                  Tampoco garantiza disponibilidad permanente del servicio,
                  aunque trabajamos para minimizar interrupciones.
                </li>
                <li>
                  Las interacciones entre usuarios y locales son responsabilidad
                  de las partes involucradas.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="mb-10! text4 textTC">
              <h2 className="Arvo-Bold text5 titleTC">
                8. Cambios en los términos
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Nos reservamos el derecho de modificar estos Términos en
                  cualquier momento. Notificaremos los cambios de forma visible.
                  El uso continuo de la app implica que aceptás las condiciones
                  actualizadas.
                </li>
                <li>
                  Estos Términos se rigen por las leyes de la República
                  Argentina. En caso de disputa, los conflictos serán resueltos
                  por los tribunales ordinarios con jurisdicción en la Ciudad
                  Autónoma de Buenos Aires.
                </li>
              </ul>
            </section>
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
