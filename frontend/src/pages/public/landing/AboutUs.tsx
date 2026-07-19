import DownloadSectionBG from "@/components/shared/DownloadSectionBG";
import { LineShadowText } from "@/components/ui/feedback/line-shadow-text";

const pillars = [
  {
    id: "mision",
    number: "001",
    title: "Misión",
    description:
      "Brindar una plataforma gastronómica integral que potencie tanto a los negocios del sector como a los cocineros del hogar, facilitando la tecnología y la comunidad necesarias para hacer de cada comida una experiencia ágil, memorable y cercana.",
    included: [
      "Digitalización inmediata para restaurantes locales",
      "Espacio interactivo para compartir e inspirar con recetas",
      "Optimización operativa mediante códigos QR y autogestión",
    ],
  },
  {
    id: "vision",
    number: "002",
    title: "Visión",
    description:
      "Ser el ecosistema gastronómico líder en conectar las experiencias culinarias de las salidas a comer con el placer de cocinar en casa, eliminando la saturación de aplicaciones y convirtiendo a la comida en un lazo social.",
    included: [
      "Plataforma unificada de doble entorno",
      "Recomendaciones inteligentes personalizadas por geolocalización",
      "Expansión e integración de la comunidad gastronómica",
    ],
  },
  {
    id: "valores",
    number: "003",
    title: "Valores",
    description:
      "Nos guía la pasión por la cocina, el compromiso genuino con el desarrollo del comercio gastronómico local, y la búsqueda constante de la excelencia tecnológica. Creemos en una conexión más transparente, segura y humana.",
    included: [
      "Fomento directo de la economía de cercanía",
      "Reducción del desperdicio alimentario hogareño",
      "Seguridad en transacciones y protección de datos",
    ],
  },
];

export default function AboutUs() {
  return (
    <main
      className="min-h-screen bg-[#141414] text-text-1 flex flex-col gap-y-12 pt-[10vh] p-[2vh] md:p-[10vh]"
    >
      {/* Hero Section */}
      <section className="min-h-[40vh] flex flex-col md:flex-row gap-12 items-stretch">
        <div className="flex-1 flex items-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-text-1 leading-none">
            Sobre <br />
            <LineShadowText className="italic" as="span" shadowColor={"#fff"}>
              Nosotros
            </LineShadowText>
          </h1>
        </div>
        <div className="flex-1 flex items-end">
          <p className="text-text-2 text-base leading-7 italic">
            &quot;En un mundo donde la tecnología a menudo fragmenta nuestras
            experiencias, en DualEat elegimos unirlas. Nuestra plataforma nace
            para resolver la saturación de aplicaciones de un solo uso,
            eliminando la fricción entre la experiencia de salir a comer y el
            placer de cocinar en casa. Somos el puente digital que conecta a los
            establecimientos gastronómicos con sus clientes de una manera más
            inteligente, ágil y humana.&quot;
          </p>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="flex flex-col gap-y-16 py-12">
        {pillars.map((item) => (
          <div key={item.id} className="border-t border-gray-800 pt-10">
            <div className="grid grid-cols-12 gap-6 md:gap-8 items-start">
              {/* Number */}
              <div className="col-span-12 lg:col-span-1 text-text-6 font-mono text-sm tracking-widest">
                {item.number}
              </div>

              {/* Title */}
              <div className="col-span-12 lg:col-span-6 text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-1">
                {item.title}
              </div>

              {/* Description & What's Included */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-y-6">
                <p className="text-text-2 text-[15px] md:text-base leading-relaxed font-light">
                  {item.description}
                </p>

                <div className="flex flex-col gap-y-3">
                  <span className="text-sm font-bold uppercase tracking-wider text-text-2">
                    Qué incluye
                  </span>
                  <ul className="space-y-2">
                    {item.included.map((inc, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-2 flex items-start gap-x-2 font-light"
                      >
                        <span className="text-text-6 font-mono">+</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Mini Footer */}
      <div className="flex flex-col gap-y-2 mt-auto">
        <div className="border-t border-gray-800 w-full" />
        <div className="flex flex-row justify-between items-center">
          <span className="text-xs tracking-tighter font-normal text-text-6">
            (v01)
          </span>

          <span className="text-xs tracking-tighter font-normal text-text-6">
            @{new Date().getFullYear()} DualEat
          </span>
        </div>
      </div>

      {/* Download Section */}
      <section className="w-full max-w-[90vw] mx-auto overflow-hidden my-12">
        <DownloadSectionBG
          background="bg-gradient-to-b from-[#ED213A] to-[#93291E]"
        />
      </section>
    </main>
  );
};