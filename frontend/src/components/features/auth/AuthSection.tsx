import React, { useMemo, useState, useEffect } from "react";
import { ROUTES } from "@/api/constants/constants";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "react-router-dom";

import BackgroundA from "@assets/images/auth/Background-A.jpg";
import BackgroundB from "@assets/images/auth/Background-B.jpg";
import BackgroundC from "@assets/images/auth/Background-C.jpg";

import LogoWhite from "@assets/icon/Logo_DualEat.png";
import { getDeviceId } from "@/utils/device";
import { appConfig } from "@/api/config/AplicationConfig";
import { StripedPattern } from "@/components/ui/feedback/striped-pattern";
import { BorderBeam } from "@/components/ui/feedback/border-beam";

interface Props {
  flex: "right" | "left";
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  children2?: React.ReactNode;
}

const AuthSection: React.FC<Props> = ({
  flex,
  title,
  subtitle,
  children,
  children2,
}) => {
  const location = useLocation();

  const images: string[] = useMemo(
    () => [BackgroundA, BackgroundB, BackgroundC],
    [],
  );

  const carouselTexts: string[] = [
    "No salgas a comer, salí a disfrutar. Te ayudamos a descubrir esos rincones gastronómicos escondidos que combinan de manera exacta con tu paladar, tus gustos y tu ritmo de vida.",
    "Transformá tu relación con la comida. Aprendé nuevas técnicas culinarias y conectá con una comunidad que entiende que cocinar también es un arte.",
    "Historias que se cuentan alrededor de la mesa. Compartí tus secretos de cocina, seguí los pasos de tus cocineros favoritos y formá parte del punto de encuentro de los verdaderos amantes de la gastronomía.",
  ];

  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex: number) => (prevIndex + 1) % images.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleDotClick = (index: number) => {
    setIndex(index);
  };

  const handleGoogleLogin = async () => {
    const deviceID = await getDeviceId();
    const backendUrl = `${appConfig.API_URL}/auth/google?platform=web&deviceId=${deviceID}`;

    window.location.href = backendUrl;
  };

  const styles = flex === "right" ? "flex-row-reverse" : "flex-row";
  const isLeft = flex === "left";

  const selected = images[index];

  return (
    <main className={`min-h-screen w-full ${styles} flex flex-row bg-bg-gray`}>
      <section className="relative" style={{ flex: 1 }}>
        <StripedPattern className="absolute inset-0 opacity-20 stroke-gray-400 z-0 pointer-events-none stroke-[0.3]" />

        <div className="relative z-10 flex h-full w-[60vh] flex-col gap-y-8 justify-center mx-auto">
          <header className="flex flex-col gap-y-3 items-center">
            <h2 className="font-black text-text-3 text-3xl">{title}</h2>
            <p className="text-text-4 text-lg font-light">{subtitle}</p>
          </header>

          {children}

          <footer className="flex flex-col gap-y-6">
            {location.pathname !== ROUTES.AUTH.ONBOARDING &&
              location.pathname !== ROUTES.AUTH.REGISTER_LOCAL && (
                <div className="space-y-3">
                  <div className="flex *:flex-1 w-full items-center justify-center gap-x-2">
                    <div className="border-t border-gray-300" />

                    <span className="text-sm text-text-6 text-center">
                      O continúa con
                    </span>

                    <div className="border-t border-gray-300" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    className="flex w-full text-sm font-bold text-text-5 items-center cursor-pointer justify-center py-3 border border-gray-300 rounded-sm"
                  >
                    <svg className="w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {location.pathname !== ROUTES.AUTH.LOGIN
                      ? "Registrarse con Google"
                      : "Iniciar sesión con Google"}
                  </button>
                </div>
              )}
            {children2}
          </footer>
        </div>
      </section>

      <section className="hidden md:flex md:flex-col md:flex-1 overflow-hidden relative">
        <img
          src={selected}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black opacity-70 w-full h-full z-5 pointer-events-none" />

        <div
          className={`flex w-full z-10 py-6 px-8 ${!isLeft ? "justify-end items-end" : "justify-start items-start"}`}
        >
          <Link
            to={ROUTES.PUBLIC.HOME}
            title="Volver al inicio"
            className="group transition-all duration-300  cursor-pointer"
          >
            <ArrowLeft
              color="#fff"
              className={`group-hover:scale-102 group-hover:-translate-x-3 transition-all duration-300`}
              size={28}
            />
          </Link>
        </div>

        <div
          className="flex flex-col items-center justify-center flex-1"
          style={{ zIndex: 10 }}
        >
          <div
            style={{
              backgroundColor: "#1b1b1b",

              borderBottomLeftRadius: isLeft ? 225 : 0,
              borderTopLeftRadius: isLeft ? 225 : 0,

              borderBottomRightRadius: !isLeft ? 225 : 0,
              borderTopRightRadius: !isLeft ? 225 : 0,
            }}
            className={`${isLeft ? "items-end text-right" : "items-start text-left"} relative overflow-hidden p-8 flex flex-col gap-y-4 justify-evenly w-[90%] flex-1 max-w-[450px] max-h-[540px] h-auto`}
          >
            <BorderBeam
              duration={8}
              size={400}
              borderWidth={3}
              colorFrom="#B53325"
              colorTo="transparent"
            />
            <BorderBeam
              duration={8}
              delay={2}
              size={400}
              borderWidth={3}
              colorFrom="#f48c06"
              colorTo="transparent"
            />

            <BorderBeam
              duration={8}
              delay={6}
              size={400}
              borderWidth={3}
              colorFrom="#e5a657"
              colorTo="transparent"
            />
            <div
              className={`flex flex-col ${!isLeft ? "items-start" : "items-end"} gap-y-3`}
            >
              <img
                src={LogoWhite}
                alt="DualEat Logo"
                className="w-[32px] h-auto"
              />

              <h2 className="text-3xl text-text-1 font-bold">DualEat</h2>
              <p className="text-base font-light text-text-2">{carouselTexts[index]}</p>
            </div>

            <div className="flex flex-row gap-x-2">
              {images.map((_, idx: number) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className={`h-1 ${
                    index === idx
                      ? "w-[45px] bg-white rounded-full"
                      : "w-[30px] cursor-pointer rounded-full bg-gray-400 opacity-60"
                  } transition-all duration-300`}
                  aria-label={`Ir a la diapositiva ${idx + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthSection;
