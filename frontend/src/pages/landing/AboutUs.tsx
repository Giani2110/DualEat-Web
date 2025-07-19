import React from "react";

import DownloadSectionBG from "../../components/DownloadSectionBG";

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bgsemi-white pt-[15px]">
      <div className="rounded-[20px] mx-4 bg-gradient-to-r from-[#ED213A] to-[#93291E] text-white h-[400px] relative">
        <div className="max-w-screen-2xl mx-auto text-center pt-[160px]">
          <h1 className="text-[48px] font-extrabold mb-4">Sobre nosotros</h1>
          <p className="text-[18px] max-w-3xl mx-auto">
            Apasionados por la comida, la tecnología y las experiencias simples
            pero memorables.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-4 mt-4">
        {/* Principles Section */}
        <div className="bg-gray py-[100px] px-8 rounded-[20px]">
          <div className="max-w-[70%] mx-auto">
            <div className="grid grid-cols-2 justify-center">
              <h2 className="text-[32px] font-extrabold">
                Nuestros principios
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-x-20">
              <div>
                <h3 className="text5 font-bold tracking-tight text-[18px] mt-[32px] mb-[12px]">
                  Diseñar con foco en las personas, negocios, foodies y
                  cocineros caseros
                </h3>
                <p className="text4 tracking-tight text-[18px]">
                  Pensamos en cada tipo de usuario: foodies, clientes y
                  cocineros caseros. Cada función está hecha para resolver
                  necesidades reales y mejorar la experiencia.
                </p>

                <h3 className="text5 font-bold tracking-tight text-[18px] mt-[32px] mb-[12px]">
                  Ser inclusivos y accesibles
                </h3>
                <p className="text4 tracking-tight text-[18px]">
                  Diseñamos una plataforma pensada para todos, fácil de usar,
                  adaptable a distintos perfiles, dietas, edades y necesidades.
                </p>
              </div>

              <div>
                <h3 className="text5 font-bold tracking-tight text-[18px] mt-[32px] mb-[12px]">
                  Priorizar lo que aporta valor
                </h3>
                <p className="text4 tracking-tight text-[18px]">
                  Evitamos saturar con funciones innecesarias. Solo
                  implementamos herramientas útiles, simples y relevantes para
                  el día a día.
                </p>
                <h3 className="text5 font-bold tracking-tight text-[18px] mt-[32px] mb-[12px]">
                  Impulsar a los negocios gastronómicos
                </h3>
                <p className="text4 tracking-tight text-[18px]">
                  Buscamos que los locales crezcan de forma sostenible,
                  brindándoles visibilidad, estadísticas y herramientas simples
                  para fidelizar clientes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision and Mission Section */}
        <div className="bg-gray py-[70px] px-8 mb-10 rounded-[20px] mt-4">
          <div className="grid lg:grid-cols-2 gap-10 max-w-[70%] mx-auto">
            {/* Vision */}
            <div>
              <h2 className="text-[32px] font-extrabold mb-3">Visión</h2>
              <p className="text4 leading-[28px] text-[18px]">
                Ser la aplicación gastronómica líder en conectar experiencias
                culinarias tanto en locales como en el hogar, transformando la
                forma en que las personas descubren, ordenan y comparten comida
                en Latinoamérica.
              </p>
            </div>

            {/* Mission */}
            <div className="lg:text-right">
              <h2 className="text-[32px] font-extrabold  mb-3 ">Misión</h2>
              <p className="text4 leading-[28px] text-[18px]">
                Brindar una plataforma integral que permita a los negocios
                gastronómicos y cocineros a los amantes de la cocina,
                facilitando la tecnología, comunidad y gamificación para hacer
                de cada comida una experiencia personalizada, accesible y
                memorable.
              </p>
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

export default AboutUs;
