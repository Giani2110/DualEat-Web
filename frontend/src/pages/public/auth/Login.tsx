import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import { ROUTES } from "@/api/constants/constants";
import AuthSection from "@/components/public/auth/AuthSection";

import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { login } = useAuth();

  console.log("reCAPTCHA token:", recaptchaToken);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaToken) {
      toast.error("Por favor, completa el reCAPTCHA antes de continuar.");
      return;
    }

    const response = await login(email, password, rememberMe, recaptchaToken);

    if (response === null) {
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    }

    if (response?.success && response.user) {
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();

      if (response.user.isBusiness) {
        navigate(ROUTES.LOCAL.DASHBOARD);
      } else {
        navigate(ROUTES.USER.DASHBOARD);
      }

      console.log("Inicio de sesión exitoso:", response);
    }
  };

  return (
    <AuthSection
      flex="flex-row-reverse"
      color="bg-red"
      title="Bienvenido de nuevo"
      subtitle="Ingresa a tu cuenta y conecta con tu comida, como nunca antes"
      children2={
        <div className="text-center text-[15px] flex items-center justify-center mt-6 gap-3">
          <span className="text4">¿No tienes cuenta? </span>
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="text5 underline cursor-pointer hover:text-red-600 font-bold"
          >
            Regístrate en DualEat
          </Link>
        </div>
      }
      background="left-background"
      Dform="Dform"
    >
      {step === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
          className="flex flex-col gap-5"
        >
          <div className="mt-3">
            <div className="font-medium text-[15px] mb-2 text5">Email</div>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-[8px] focus:ring-1 focus:ring-[#B2B2B2] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center mt-2">
            <input
              aria-label="Recuérdame"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 cursor-pointer border-gray-300 rounded focus:ring-[#B53325]"
            />
            <span className="ml-2 text-[15px] text5">Recuérdame</span>
          </div>

          <button
            type="submit"
            className="Dosis-Bold w-full mt-3 mb-6 text-[15px] bg-red text-white py-[12px] px-4 rounded-lg cursor-pointer font-medium"
          >
            Siguiente
          </button>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
          <div className="mt-3">
            <div className="font-medium text-[15px] mb-2 text5 opacity-50">
              Email
            </div>
            <input
              aria-label="Email"
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-[10px] border border-gray-300 rounded-[8px] outline-none bg-gray-100 cursor-not-allowed opacity-40"
            />
          </div>
          <div>
            <div className="font-medium text-[15px] mb-2 text5">Contraseña</div>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 text5 py-[10px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#B2B2B2] focus:border-transparent outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between">
              <Link
                to={ROUTES.AUTH.RESET_PASSWORD}
                className="text-[#822621] text-[15px] cursor-pointer underline hover:scale-101 transition-transform"
              >
                ¿Olvidé mi contraseña?
              </Link>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="cursor-pointer hover:scale-102 transition-transform"
              >
                <span className="text4 text-[13px] underline">Volver</span>
              </button>
            </div>
            {/* reCAPTCHA */}
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LcEHaYrAAAAAOD2H4YUWk_9AiJsgtAdbHI1usz1"
              onChange={(token) => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
              theme="light"
              size="normal"
              className="recaptcha-scale mt-5"
            />
          </div>
          <button
            type="submit"
            className="Dosis-Bold w-full mt-3 mb-6 text-[15px] bg-red text-white py-[12px] px-4 rounded-lg cursor-pointer font-medium"
          >
            Iniciar Sesión {" → "}
          </button>
        </form>
      )}
    </AuthSection>
  );
};

export default Login;
