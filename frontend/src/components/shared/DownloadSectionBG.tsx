import React from "react";
import GooglePlay from "@assets/images/GooglePlay_Badge_Web.png";
import Logo from "@assets/images/icon/Logo_DualEat.png";

interface Props {
  background: string;
  background2: string;
}

const DownloadSectionBG: React.FC<Props> = ({ background, background2 }) => {
  return (
    <section className={`${background} rounded-3xl h-[400px] overflow-hidden relative`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row items-center justify-between">

        {/* Left Column - Content */}
        <div className="md:w-[50%] lg:w-[55%] text-center md:text-left pt-12 md:pt-0 z-10">
          <h1 className="text-[28px] md:text-[32px] Dosis-Bold text-white leading-tight mb-4">
            Descargá DualEat y descubrí un mundo lleno de sabores
          </h1>
          <p className="text-[14px] md:text-[15px] leading-relaxed text-white/90 mb-6 max-w-[550px] font-light">
            Descubrí restaurantes, bares y cafeterías que se adaptan a tus
            gustos. Con DualEat, encontrás espacios únicos y comunidades
            gastronómicas que reflejan tu estilo y paladar. Explorá, valorá y
            viví nuevas experiencias en cada salida.
          </p>
          <div className="flex justify-center md:justify-start">
            <a href="#" className="hover:scale-105 transition-transform duration-300 inline-block">
              <img
                src={GooglePlay}
                alt="Google Play"
                className="w-[150px] h-[45px] object-contain"
              />
            </a>
          </div>
        </div>

        {/* Right Column - Overlapping Dynamic CSS Mockups */}
        <div className="md:w-[50%] lg:w-[45%] h-full relative hidden md:flex items-center justify-center z-10 select-none">

          {/* Welcome Phone Mockup (Left Phone) */}
          <div className="absolute right-[125px] lg:right-[150px] bottom-[-20px] w-[215px] h-[375px] bg-[#0A0A0A] rounded-[28px] border-[5px] border-[#1C1C1E] shadow-2xl overflow-hidden -rotate-6 transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] group/welcome cursor-pointer">
            {/* Screen Content */}
            <div className="w-full h-full relative bg-gradient-to-b from-[#1c1c1c] via-[#2d1210] to-[#0d0d0d] flex flex-col justify-between p-3 pb-4">

              {/* Status Bar */}
              <div className="flex justify-between items-center text-[7px] text-white/50 font-semibold px-2">
                <span>12:30</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  <span className="w-2.5 h-1.5 border border-white/50 rounded-sm"></span>
                </div>
              </div>

              {/* Centered logo watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
                <img src={Logo} className="w-28 h-28 object-contain" alt="Watermark" />
              </div>

              {/* Screen Content Form */}
              <div className="z-10 flex flex-col items-center mt-auto">
                <h3 className="text-white text-[14px] font-bold Dosis-Bold text-center leading-tight">
                  Bienvenido/a a DualEat
                </h3>
                <p className="text-[#bdbdbd] text-[8.5px] text-center mt-2 leading-normal px-2 font-light">
                  Sumergite en un universo de alta gastronomía: una experiencia culinaria diseñada para deleitar tus sentidos.
                </p>

                {/* Google Button */}
                <div className="mt-5 bg-[#212121] w-full py-2.5 rounded-full items-center flex justify-center gap-1.5 shadow-md border border-white/5 hover:bg-[#2c2c2c] transition-colors">
                  <img
                    src="https://img.icons8.com/fluency/48/google-logo.png"
                    className="w-3.5 h-3.5"
                    alt="Google"
                  />
                  <span className="text-white text-[8px] font-bold">
                    Iniciar Sesión con Google
                  </span>
                </div>

                {/* Email Button */}
                <div className="mt-2.5 bg-[#b53325] w-full py-2.5 rounded-full items-center flex justify-center gap-1.5 shadow-md hover:bg-[#923025] transition-colors">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white text-[8px] font-bold">
                    Iniciar Sesión con email
                  </span>
                </div>

                {/* Footer Link */}
                <p className="text-center text-[7.5px] text-[#bdbdbd] mt-4 font-light">
                  ¿Todavía no tienes una cuenta?{" "}
                  <span className="text-white font-bold">Regístrate</span>
                </p>
              </div>
            </div>

            {/* Phone Speaker/Camera Notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#0A0A0A] rounded-b-xl flex items-center justify-center gap-1 z-50">
              <div className="w-4 h-[1.5px] bg-[#2C2C2E] rounded-full"></div>
              <div className="w-[3px] h-[3px] bg-[#2C2C2E] rounded-full"></div>
            </div>
          </div>

          {/* Login Phone Mockup (Right Phone, Overlapping) */}
          <div className="absolute right-[20px] bottom-[-45px] w-[215px] h-[375px] bg-[#0A0A0A] rounded-[28px] border-[5px] border-[#1C1C1E] shadow-2xl overflow-hidden rotate-3 transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] group/login cursor-pointer">
            {/* Screen Content */}
            <div className="w-full h-full relative bg-gradient-to-b from-[#280a08] via-[#1a1a1a] to-[#0f0f0f] flex flex-col justify-between p-3">

              {/* Status Bar */}
              <div className="flex justify-between items-center text-[7px] text-white/50 font-semibold px-2">
                <span>12:31</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  <span className="w-2.5 h-1.5 border border-white/50 rounded-sm"></span>
                </div>
              </div>

              {/* Login Banner (Top Half) */}
              <div className="mt-2 flex flex-col justify-start">
                <div className="flex items-center justify-between px-1">
                  <svg className="w-3.5 h-3.5 text-white/60 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-[7.5px] text-[#bdbdbd] font-light">
                    ¿No tienes cuenta? <span className="text-white font-bold">Regístrate</span>
                  </span>
                </div>

                {/* Dynamic Brand Logo center */}
                <div className="flex items-center justify-center gap-1 mt-6">
                  <img src={Logo} className="w-[18px] h-[18px] object-contain" alt="Logo" />
                  <span className="text-white text-[13px] font-bold tracking-tight Dosis-Bold">DualEat</span>
                </div>
              </div>

              {/* Bottom Sheet Card */}
              <div className="bg-[#1A1A1A] border-t border-white/5 rounded-t-[20px] px-3 pt-3.5 pb-4 mt-auto flex flex-col gap-2 w-[calc(100%+24px)] -mx-3 z-10">
                <div className="text-center mb-1">
                  <h4 className="text-[12px] font-bold text-white Dosis-Bold tracking-tight">Iniciar sesión</h4>
                  <p className="text-[7.5px] text-gray-400 font-light mt-0.5">
                    Conéctate con tu comida, como nunca antes
                  </p>
                </div>

                {/* Simulated inputs */}
                <div className="flex flex-col gap-1.5">
                  {/* Email */}
                  <div className="flex flex-col">
                    <span className="text-[6.5px] text-[#bdbdbd] mb-0.5 pl-1 font-semibold">Email</span>
                    <div className="border border-white/10 rounded-lg px-2 py-1 bg-black/40 text-[8px] text-white font-light flex items-center">
                      user@dualeat.com
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col">
                    <span className="text-[6.5px] text-[#bdbdbd] mb-0.5 pl-1 font-semibold">Contraseña</span>
                    <div className="border border-white/10 rounded-lg px-2 py-1 bg-black/40 text-[8px] text-white/40 tracking-widest flex items-center justify-between">
                      <span>••••••••</span>
                      <svg className="w-2.5 h-2.5 text-[#bdbdbd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Forgot Link */}
                <span className="text-[7px] text-white font-bold text-right pr-1 cursor-pointer hover:underline">
                  ¿Olvidaste tu contraseña?
                </span>

                {/* Action button */}
                <div className="mt-1 bg-[#b53325] hover:bg-[#923025] w-full py-1.5 rounded-full items-center flex justify-center shadow-md transition-colors">
                  <span className="text-white text-[8px] font-bold">Iniciar Sesión</span>
                </div>

                {/* Divider */}
                <div className="flex items-center my-1">
                  <div className="flex-1 h-[0.5px] bg-white/10"></div>
                  <span className="mx-2 text-[6px] text-white/30">**</span>
                  <div className="flex-1 h-[0.5px] bg-white/10"></div>
                </div>

                {/* Google Button */}
                <div className="bg-[#f5f5f5] border border-gray-300 w-full py-1.5 rounded-full items-center flex justify-center gap-1 shadow-sm hover:bg-gray-100 transition-colors">
                  <img
                    src="https://img.icons8.com/fluency/48/google-logo.png"
                    className="w-3 h-3"
                    alt="Google Logo"
                  />
                  <span className="text-gray-700 text-[7.5px] font-bold">
                    Iniciar sesión con Google
                  </span>
                </div>
              </div>
            </div>

            {/* Phone Speaker/Camera Notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#0A0A0A] rounded-b-xl flex items-center justify-center gap-1 z-50">
              <div className="w-4 h-[1.5px] bg-[#2C2C2E] rounded-full"></div>
              <div className="w-[3px] h-[3px] bg-[#2C2C2E] rounded-full"></div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default DownloadSectionBG;
