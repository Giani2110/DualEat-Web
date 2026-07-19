import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { createUserCheckout } from "@services/subscription.api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { X, Check, Loader2, BadgeCheck } from "lucide-react";
import { createPortal } from "react-dom";
import { Particles } from "../ui/feedback/particles";

import Logo from "@assets/icon/Logo_DualEat.png";
import { formatPrice } from "@/utils/format";
import { ROUTES } from "@/api/constants/constants";
import { subscriptionPlans } from "@/interface/global";


export default function SubscriptionView() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estado para el ciclo de facturación: "MENSUAL" o "ANUAL"
  const [billingCycle, setBillingCycle] = useState<"MENSUAL" | "ANUAL">(
    "MENSUAL",
  );

  // Estado para el plan seleccionado: "BASIC" o "PREMIUM"
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PREMIUM">(
    "PREMIUM",
  );

  // Estado de carga para Mercado Pago
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (selectedPlan === "BASIC") return;

    setLoading(true);
    try {
      const planKey =
        billingCycle === "MENSUAL"
          ? "COMMUNITY_USER_MONTHLY"
          : "COMMUNITY_USER_ANNUAL";

      const response = await createUserCheckout(planKey);

      if (response && response.success && response.checkoutUrl) {
        // Redirigir al usuario a la pasarela de pago de Mercado Pago
        window.location.href = response.checkoutUrl;
      } else {
        toast.error(response.message || "No se pudo iniciar el checkout");
      }
    } catch (error: any) {
      console.error("Error al procesar suscripción:", error);
      toast.error("Ocurrió un error inesperado al conectar con Mercado Pago");
    } finally {
      setLoading(false);
    }
  };

  const isUserPremium =
    user?.subscription_status === "ACTIVE" ||
    user?.subscription_status === "TRIAL";

  let slicedPlans = subscriptionPlans.slice(0, 2);

  if (!user?.is_business) {
    slicedPlans = subscriptionPlans.slice(0, 2);
  } else {
    slicedPlans = subscriptionPlans.slice(0, 3);
  }

  return createPortal(
    <div className="fixed noScroll z-50 inset-0 min-h-screen bg-black text-white flex flex-col font-sans overflow-x-hidden pb-40 select-none">
      <Particles
        className="absolute inset-0 z-0"
        quantity={800}
        ease={40}
        color="#fff"
        refresh
        staticity={200}
      />

      <header className="flex items-center px-6 py-4 w-full">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all duration-200"
          aria-label="Volver"
        >
          <X className="w-5 h-5 text-text-1" />
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col w-full px-6 py-4 items-center">
        <div className="flex flex-row items-center text-center gap-4">
          <img src={Logo} alt="Logo de DualEat" className="w-5 h-5" />

          <h1 className="text-xl font-bold text-text-1">DualEat premium</h1>

          <BadgeCheck size={22} fill="#3578e4" color="black" />
        </div>

        {/* Switcher de Anual / Mensual */}
        <div className="flex justify-center mt-10">
          <div className="grid grid-cols-2 p-1 gap-4 rounded-full border border-text-1/20">
            {["Anual", "Mensual"].map((item, idx) => {
              const isAnual = idx === 0 ? "ANUAL" : "MENSUAL";

              return (
                <button
                  key={idx}
                  onClick={() => setBillingCycle(isAnual)}
                  className={`flex-1 py-2 px-8 rounded-full text-sm font-semibold text-center cursor-pointer transition-colors duration-300 ${
                    billingCycle === isAnual
                      ? "text-black bg-text-1"
                      : "text-text-2/50 hover:text-text-2"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarjetas de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-12 items-stretch">
          {slicedPlans.map((item, idx) => {
            const isPremium = item.title.toLowerCase() === "premium";
            const planKey = isPremium ? "PREMIUM" : "BASIC";
            const isSelected = selectedPlan === planKey;

            // Determinar ciclo
            const cycleKey = billingCycle === "MENSUAL" ? "monthly" : "annual";
            const priceData = item.prices[cycleKey];
            const priceString = `${formatPrice(priceData.price)} ${priceData.currency}`;
            const periodString = billingCycle === "MENSUAL" ? "/ mes" : "/ año";

            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedPlan(planKey)}
                className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 cursor-pointer backdrop-blur-md h-full  justify-between ${
                  isSelected
                    ? isPremium
                      ? "bg-bg-yellow/20 border-bg-yellow"
                      : "border-text-2"
                    : "border-text-2/20 hover:border-bg-yellow"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mt-2">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">
                        {item.title}
                      </h2>
                      <p className="text-text-6 text-sm">{item.description}</p>
                    </div>

                    {/* Selector */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex justify-center items-center transition-all ${
                        isSelected
                          ? isPremium
                            ? "bg-bg-yellow border-bg-yellow"
                            : "border-white bg-white"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 stroke-[3] ${
                            isPremium ? "text-white" : "text-black"
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  <div className="my-6">
                    <div className="flex items-baseline gap-x-2">
                      <span className="text-3xl font-extrabold text-white">
                        {priceString}
                      </span>
                      <span className="text-text-6 text-sm ml-1">
                        {periodString}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 my-4" />

                  {/* Características */}
                  <ul className="space-y-3.5 text-sm text-zinc-100">
                    {item.benefits.map((item, bIdx) => (
                      <li key={bIdx} className="flex items-start">
                        <span className="ml-3">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full bg-black border-t border-white py-5 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">
                Plan {selectedPlan === "PREMIUM" ? "Premium" : "Básico"}
              </span>
              <span className="text-text-2 text-sm">
                ({billingCycle === "MENSUAL" ? "Mensual" : "Anual"})
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Detalles de precio lateral */}
            <div className="text-left sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end gap-x-2">
              <span className="text-2xl font-black text-white">
                {(() => {
                  const selectedPlanObj = subscriptionPlans.find(
                    (p) =>
                      p.title.toLowerCase() ===
                      (selectedPlan === "PREMIUM" ? "premium" : "básico"),
                  );
                  if (!selectedPlanObj) return "$0.00";
                  const cycleKey =
                    billingCycle === "MENSUAL" ? "monthly" : "annual";
                  const pData = selectedPlanObj.prices[cycleKey];
                  return `${formatPrice(pData.price)} ${pData.currency}`;
                })()}
              </span>
              <span className="text-xs text-text-2">
                {billingCycle === "MENSUAL" ? "/ mes" : "/ año"}
              </span>
            </div>

            {/* Botón de Acción */}
            <div className="w-full sm:w-56 shrink-0">
              {isUserPremium && selectedPlan === "PREMIUM" ? (
                <div className="w-full bg-green-950/60 border border-green-500/40 py-3.5 rounded-xl flex items-center justify-center gap-x-2 shadow-inner">
                  <Check className="w-5 h-5 text-green-400 stroke-[3]" />
                  <span className="text-green-400 font-bold text-sm">
                    Ya eres miembro Premium
                  </span>
                </div>
              ) : selectedPlan === "BASIC" ? (
                <div className="w-full bg-zinc-800/40 border border-zinc-700/30 py-3.5 rounded-xl flex items-center justify-center">
                  <span className="text-zinc-400 font-bold text-sm">
                    Plan actual habilitado
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-white hover:bg-zinc-200 text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-x-2 cursor-pointer shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <span>Suscribirse y pagar</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer Términos */}
        <div className="max-w-4xl mx-auto text-sm text-text-2/50 text-center mt-4 border-t border-white/5 pt-3 leading-relaxed">
          Al suscribirte aceptas los{" "}
          <a
            href={ROUTES.PUBLIC.TERMS}
            target="_blank"
            className="underline hover:text-[#fff]"
          >
            Términos de servicio
          </a>{" "}
          del comprador. Pases de un único pago mediante Mercado Pago.
          Cancelación sin cargos automáticos recurrentes.
        </div>
      </footer>
    </div>,
    document.body,
  );
}
