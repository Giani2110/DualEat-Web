import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import DownloadSectionBG from "@components/shared/DownloadSectionBG";
import { BorderBeam } from "@/components/ui/feedback/border-beam";

const LandingBusiness = () => {
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Main Content - Business Form */}
      <main className="max-w-[70%] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:pt-[180px] md:pb-[130px] grid lg:grid-cols-2 gap-12">
        {/* Left Column - Form Info */}
        <div className="space-y-8 max-w-[90%]">
          <div className="transform hover:scale-101 transition-transform duration-300 flex flex-col space-y-5">
            <h1 className="text-[45px] font-black text-text-1 leading-tight">
              Sumá tu negocio a <span className="text-bg-yellow">DualEat</span>
            </h1>
            <p className="text-text-2 text-base leading-relaxed">
              Si buscás potenciar tu negocio, llegar a nuevos clientes y
              aumentar tus ventas, sumate a DualEat. Nuestra app te permite
              digitalizar tu menú, recibir valoraciones reales, promocionar tus
              platos y formar parte de una comunidad gastronómica activa.
            </p>
          </div>

          <div className="border h-[100px] cursor-pointer p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[-2px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red rounded flex items-center justify-center hover:bg-red-600 transition-colors duration-200">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-text-1">Por mail</p>
                <p className="text-sm text-text-6">contacto@dualeat.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - CTA */}
        <div className="relative p-10 rounded-2xl w-full transition-all duration-500 flex flex-col justify-center relative overflow-hidden group">
          <BorderBeam
            duration={8}
            size={400}
            borderWidth={3}
            colorFrom="#B53325"
            colorTo="transparent"
          />

          <BorderBeam
            duration={8}
            size={400}
            delay={5}
            borderWidth={3}
            colorFrom="#3578e4"
            colorTo="transparent"
          />

          <div className="relative flex flex-col items-center text-center space-y-8 my-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-text-1 tracking-tight">
                Empezá a vender con nosotros
              </h2>
              <p className="text-text-2 text-base max-w-md mx-auto leading-relaxed">
                El proceso de registro es rápido, simple y 100% online.
                Configurá tu menú y comenzá a recibir pedidos hoy mismo.
              </p>
            </div>

            <div className="flex flex-col w-full max-w-sm space-y-4 text-left p-6 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="font-medium text-text-1 text-sm">
                  Registro gratuito y sin compromiso
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="font-medium text-text-1 text-sm">
                  Panel para gestionar tu menú
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="font-medium text-text-1 text-sm">
                  Funciones dedicadas para impulsar tu negocio
                </span>
              </div>
            </div>

            <Link
              to="/signup/locals"
              className="w-full max-w-sm group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-red border border-transparent rounded-xl hover:bg-red-700 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative flex items-center gap-2">
                Registrar mi local
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </main>

      <section className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <DownloadSectionBG background="bg-gradient-to-b from-[#232526] to-[#414345]" />
      </section>
    </div>
  );
};

export default LandingBusiness;
