import { Mail, MessageCircle, Store, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import DownloadSectionBG from "@components/shared/DownloadSectionBG";

const LandingBusiness = () => {

  return (
    <div className="min-h-screen bgLanding">
      {/* Main Content - Business Form */}
      <main className="max-w-[70%] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:pt-[180px] md:pb-[130px] grid lg:grid-cols-2 gap-12">
        {/* Left Column - Form Info */}
        <div className="space-y-8 max-w-[90%]">
          <div className="transform hover:scale-101 transition-transform duration-300 flex flex-col space-y-5">
            <h1 className="text-[45px] font-bold leading-tight">
              Sumá tu negocio a <span className="text-[#b53325]">DualEat</span>
            </h1>
            <p className="text4 text-[15px] leading-loose">
              Si buscás potenciar tu negocio, llegar a nuevos clientes y
              aumentar tus ventas, sumate a DualEat. Nuestra app te permite
              digitalizar tu menú, recibir valoraciones reales, promocionar tus
              platos y formar parte de una comunidad gastronómica activa.
            </p>
          </div>

          <div className="bg-white h-[100px] cursor-pointer p-6 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[-2px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red rounded flex items-center justify-center hover:bg-red-600 transition-colors duration-200">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text5">Por mail</p>
                <p className="text-sm text4">contacto@dualeat.com</p>
              </div>
            </div>
          </div>

          <div className="bg-white h-[100px] cursor-pointer p-6 rounded-lg shadow-sm  hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[-2px]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow rounded flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text5">Chatea con nosotros</p>
                <p className="text-sm text4">Lun a Viernes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - CTA */}
        <div className="bg-white p-10 rounded-2xl w-full shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-50 group-hover:bg-red-100 transition-colors duration-500"></div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-8 my-auto">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-6 transition-transform duration-300 shadow-sm border border-red-100">
              <Store className="w-10 h-10 text-red" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Empezá a vender con nosotros
              </h2>
              <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
                El proceso de registro es rápido, simple y 100% online. Configurá tu menú y comenzá a recibir pedidos hoy mismo.
              </p>
            </div>

            <div className="flex flex-col w-full max-w-sm space-y-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="font-medium text-sm">Registro gratuito y sin compromiso</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="font-medium text-sm">Panel para gestionar tu menú</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="font-medium text-sm">Funciones dedicadas para impulsar tu negocio</span>
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

      <section className="mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden mb-10">
        <DownloadSectionBG
          background="bg-gradient-to-b from-[#232526] to-[#414345]"
          background2="bg-yellow"
        />
      </section>
    </div>
  );
};

export default LandingBusiness;
