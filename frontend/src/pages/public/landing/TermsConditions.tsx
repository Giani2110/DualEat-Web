import { Particles } from "@/components/ui/feedback/particles";
import DownloadSectionBG from "@components/shared/DownloadSectionBG";

const TermsConditions = () => {
  return (
    <main
      className="relative min-h-screen bg-[#141414] text-text-1 flex flex-col gap-y-12 pt-[15vh] p-[2vh] md:p-[10vh]"
    >
      <Particles
        staticity={30}
        quantity={200}
        className="absolute inset-0 z-0 w-full h-full"
      />

      <div className="w-full [&_p]:text-sm [&_li]:text-sm max-w-4xl flex flex-col">
        <header className="mb-12 border-b border-gray-300 pb-8">
          <h1 className="text-5xl lg:text-6xl font-black text-text-1 tracking-tight mb-4 uppercase">
            Términos y Condiciones
          </h1>
          <p className="text-xs text-text-2 font-bold uppercase tracking-wider">
            Última actualización: Julio 2026
          </p>
        </header>

        <p className="text-base text-text-1 leading-relaxed font-light mb-12">
          Bienvenido/a a <strong>DualEat</strong>, una plataforma digital
          diseñada para conectar personas con experiencias gastronómicas, tanto
          en locales físicos como desde casa. Al registrarte o utilizar nuestros
          servicios, aceptás estos Términos y Condiciones de uso.
        </p>

        {/* Terms content */}
        <div className="flex flex-col gap-y-12">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold font-bold text-text-1">
              1. Identificación
            </h2>
            <p className="text-text-1 font-light leading-relaxed">
              DualEat es un proyecto académico y comercial en desarrollo por
              parte de Gianfranco Andreacchi y Axel Berger, operando
              inicialmente dentro del territorio de la República Argentina.
            </p>
            <ul className="list-disc pl-5 text-text-1 font-light space-y-2">
              <li>
                Podés contactarnos a través de{" "}
                <a
                  href="mailto:contacto@dualeat.app"
                  className="text-bg-yellow hover:underline font-semibold"
                >
                  contacto@dualeat.app
                </a>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-text-1">
              2. Definiciones
            </h2>
            <div className="space-y-4 text-text-1 font-light leading-relaxed">
              <p>
                <strong className="text-text-1 font-semibold">Usuario:</strong>{" "}
                Persona que utiliza la app para buscar locales gastronómicos,
                recetas o interactuar con otros usuarios.
              </p>
              <p>
                <strong className="text-text-1 font-semibold">
                  Local / Negocio:
                </strong>{" "}
                Establecimiento gastronómico registrado que utiliza DualEat para
                mostrar su menú, promociones o gestionar interacciones con
                clientes.
              </p>
              <p>
                <strong className="text-text-1 font-semibold">
                  Plataforma:
                </strong>{" "}
                Sitio web, app móvil o servicios digitales de DualEat.
              </p>
              <p>
                <strong className="text-text-1 font-semibold">
                  Contenido:
                </strong>{" "}
                Cualquier texto, imagen, receta, menú, comentario o dato subido
                por los usuarios o el equipo de DualEat.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-text-1">
              3. Condiciones de uso
            </h2>
            <p className="text-text-1 font-light leading-relaxed">
              El uso de la plataforma implica el cumplimiento de estas reglas:
            </p>
            <ul className="list-disc pl-5 text-text-1 font-light space-y-2">
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
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-text-1">
              4. Obligaciones de los locales gastronómicos
            </h2>
            <p className="text-text-1 font-light leading-relaxed">
              Si sos dueño o administrador de un local que utiliza DualEat,
              aceptás:
            </p>
            <ul className="list-disc pl-5 text-text-1 font-light space-y-2">
              <li>
                Subir información veraz, actualizada y clara (precios, menús,
                horarios).
              </li>
              <li>
                Cumplir con las normativas locales de salubridad, atención y
                facturación.
              </li>
              <li>
                No ofrecer productos ilegales, vencidos o que puedan afectar la
                salud de los consumidores.
              </li>
              <li>
                DualEat no garantiza ni se responsabiliza por la calidad,
                cumplimiento o disponibilidad de tus productos ante los
                usuarios.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-text-1">
              5. Propiedad intelectual
            </h2>
            <div className="space-y-4 text-text-1 font-light leading-relaxed">
              <p>
                Todo el contenido original de la app (nombre, diseño, código,
                marca, textos, imágenes, funcionalidades) pertenece a DualEat y
                está protegido por leyes de propiedad intelectual.
              </p>
              <p>
                El contenido que subís (reseñas, fotos, recetas) seguirá siendo
                tuyo, pero nos otorgás una licencia para mostrarlo dentro de la
                app y promocionar la plataforma, siempre respetando tus
                derechos.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-text-1">
              6. Privacidad y datos personales
            </h2>
            <p className="text-text-1 font-light leading-relaxed">
              DualEat recopila ciertos datos personales para mejorar tu
              experiencia. Al usar nuestros servicios aceptás nuestra Política
              de Privacidad. Usamos tus datos de forma segura para:
            </p>
            <ul className="list-disc pl-5 text-text-1 font-light space-y-2">
              <li>Sugerencias personalizadas y estadísticas de uso.</li>
              <li>Comunicación y notificaciones de sistema.</li>
              <li>Ofertas y promociones gastronómicas relacionadas.</li>
            </ul>
            <p className="text-text-1 font-light leading-relaxed mt-4">
              No vendemos ni alquilamos tus datos a terceros.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-text-1">
              7. Limitación de responsabilidad
            </h2>
            <ul className="list-disc pl-5 text-text-1 font-light space-y-2">
              <li>
                DualEat no es responsable por errores en los menús, calidad de
                los productos ofrecidos, retrasos, alergias alimentarias o
                inconvenientes con los locales.
              </li>
              <li>
                Tampoco garantiza disponibilidad permanente del servicio, aunque
                trabajamos para minimizar interrupciones.
              </li>
              <li>
                Las interacciones entre usuarios y locales son responsabilidad
                exclusiva de las partes involucradas.
              </li>
            </ul>
          </section>
        </div>

        {/* SECCIÓN DE DESCARGA */}
        <section className="w-full overflow-hidden my-16">
          <DownloadSectionBG background="bg-gradient-to-b from-[#e5a657] to-[#f48c06]" />
        </section>
      </div>
    </main>
  );
};

export default TermsConditions;
