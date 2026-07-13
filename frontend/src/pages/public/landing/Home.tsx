import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Cookie, QrCode, Split, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import { subscriptionPlans } from "@/components/shared/SubscriptionView";

import BG from "@assets/images/BGDash.jpg";
import GridDistortion from "@/components/ui/feedback/GridDistortion";

import Main from "@assets/images/auth/Background-Main.jpg";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import WeatherWidget from "@/components/features/weather/WeatherWidget";

import "@assets/scss/public/landing.scss";

const Item = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-end gap-y-2 flex-1 p-4 border border-gray-300">
      {icon}
      <div className="flex flex-col gap-y-2">
        <h2 className="text-base font-bold text-text-1 leading-tight">
          {title}
        </h2>
        <p className="text-sm text-text-2 leading-relaxed max-w-md">
          {description}
        </p>
      </div>
    </div>
  );
};

export default function LandingHome() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main
      style={{ paddingBottom: "10vh" }}
      className="flex flex-col gap-y-16 bg-[#141414]"
    >
      <section className="flex flex-col-reverse md:flex-row gap-y-10 h-screen flex flex-col gap-y-16">
        <div className="flex h-full flex-1 flex-col justify-end items-start gap-y-4 px-10 py-16">
          <div className="flex flex-col w-full">
            <div className="flex flex-row items-center gap-3">
              <Clock size={12} className="text-text-2" />
              <span className="text-text-2 text-sm uppercase font-bold">
                {format(time, "iii HH:mm aaaa", {
                  locale: es,
                })}
              </span>
            </div>

            <div className="border-b border-gray-700 w-full pt-3" />
          </div>

          <h1 className="text-2xl md:text-6xl font-black text-text-1 max-w-7xl uppercase">
            El sabor de salir. El placer de cocinar.
            <span className="text-bg-red"> DualEat.</span>
          </h1>

          <p className="text-text-2 text-lg max-w-xl">
            Conecta con restaurantes emblemáticos, guarda tus platos favoritos y
            comparte trucos con entusiastas de la comida. La mesa está servida,
            solo faltas tú.
          </p>
          <WeatherWidget />
        </div>

        <div className="relative flex-1 w-full h-full">
          <GridDistortion
            imageSrc={Main}
            grid={10}
            mouse={0.25}
            strength={0.15}
            relaxation={0.9}
            className="w-full h-full absolute top-0 left-0 inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
        </div>
      </section>

      <section className="px-4 md:px-8 lg:px-16 flex flex-col lg:flex-row gap-12">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ flex: 1 }}
          className="flex flex-col gap-y-4"
        >
          <span className="text-sm font-bold text-bg-red uppercase">
            ¿Por qué DualEat?
          </span>

          <h2 className="text-4xl font-light text-text-1 leading-tight">
            Dos mundos,{" "}
            <span className="font-semibold text-text-1">
              una sola plataforma
            </span>{" "}
            gastronómica
          </h2>

          <p className="text-text-1 text-base leading-relaxed">
            Explora restaurantes cercanos, ordena en segundos y descubre recetas
            reales de una comunidad que comparte tu pasión por la comida.
          </p>

          <div className="flex flex-col gap-3 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              {[
                "Explorá menús y hacé pedidos al instante",
                "Creá y compartí tus propias recetas",
                "Conectá con comunidades gastronómicas",
              ].map((item) => (
                <li className="text-text-1 font-extralight" key={item}>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-sm text-text-1 font-medium underline underline-offset-4 hover:text-red transition-colors duration-200 w-fit"
          >
            Comenzar gratis <ArrowUpRight size={15} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
          style={{ flex: 2 }}
        >
          <div className="relative border border-dashed border-gray-400 w-full min-h-[400px] rounded-2xl overflow-hidden">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={BG}
              alt="Background"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        </motion.div>
      </section>

      <div
        style={{ height: 1 }}
        className=" gradient w-full max-w-[80vw] mx-auto"
      />

      <section
        id="Funcionalidades"
        className="flex flex-col items-end text-right gap-y-3 px-4 md:px-8 lg:px-16"
      >
        <p className="text-sm text-bg-yellow font-bold uppercase">
          Funcionalidades
        </p>

        <h2 className="text-2xl font-light text-text-1 leading-tight">
          Una aplicación con varias
          <span className="font-semibold text-text-1"> funcionalidades </span>
          <br />
          para agilizar tu experiencia.
        </h2>

        <p className="text-sm text-text-2 leading-relaxed max-w-xl">
          En DualEat encontrarás diferentes funcionalidades que harán tu
          experiencia más agradable. Podrás explorar restaurantes cercanos,
          ordenar en segundos y descubrir recetas reales de una comunidad que
          comparte tu pasión por la comida.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Item
            icon={<QrCode size={20} color="#fff" />}
            title="Códigos QR"
            description="Los pedidos y órdenes se manejan con códigos QR, agilizando la experiência y evitando tiempo malgastado."
          />
          <Item
            icon={<Sun size={20} color="#fff" />}
            title="Recomendaciones"
            description="A lo largo de tu experiencia en DualEat, se te ofrecerán recomendaciones de restaurantes y recetas basadas en tus preferencias y por tu cercanía."
          />
          <Item
            icon={<Cookie size={20} color="#fff" />}
            title="Recetas"
            description="Buscá recetas en base a los ingredientes que tienes en casa, puede que encuentres una receta hecha por alguien de tu comunidad."
          />
          <Item
            icon={<Split size={20} color="#fff" />}
            title="Dualidad bien declarada"
            description="La aplicación maneja de la mejor manera los dos modos, evitando confusiones y permitiendo un diseño entendible para el usuario."
          />
        </div>
      </section>

      <section className="px-6 md:px-16 flex flex-col gap-y-12">
        {/* Top Header bar */}
        <div className="flex flex-row justify-between items-center w-full border-b border-white/10 pb-4 text-xs uppercase tracking-widest text-[#888]">
          <span>Suscripciones</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[50vh] gap-8 items-stretch w-full">
          {subscriptionPlans.map((item, idx) => {
            const isPremium = item.title.toLowerCase() === "premium";
            const priceVal = item.prices.monthly.price;
            const priceString =
              priceVal === 0 ? "0" : priceVal.toLocaleString("es-AR");

            return (
              <div
                key={idx}
                className={`p-8 md:p-10 h-full flex flex-col justify-between text-black border border-gray-200 **:text-white`}
              >
                <div>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#707070] mb-8 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-baseline my-6">
                    <span className="text-xl font-medium align-top mr-1">
                      $
                    </span>
                    <span className="text-4xl font-extrabold tracking-tight">
                      {priceString}
                    </span>
                    <span className="text-sm font-medium text-[#707070] ml-2">
                      {priceVal === 0 ? "/ Siempre" : "/ Mes"}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-y-8">
                  <Link
                    to={isPremium ? ROUTES.AUTH.LOGIN : ROUTES.AUTH.REGISTER}
                    className="w-full flex items-center justify-between border-b border-text-2/20 pb-2 text-sm font-semibold hover:border-black transition-colors duration-200 cursor-pointer"
                  >
                    <span>
                      {isPremium
                        ? "Obtener Premium"
                        : idx === 2
                          ? "Registrar Local"
                          : "Empezar ya"}
                    </span>
                    <span className="text-lg">┐</span>
                  </Link>

                  <div className="flex flex-col gap-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#707070]">
                      Qué incluye
                    </span>
                    <ul className="flex flex-col gap-y-2 text-sm text-[#3A3A3C]">
                      {item.benefits.map((benefit, bIdx) => (
                        <li key={bIdx}>+ {benefit.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
