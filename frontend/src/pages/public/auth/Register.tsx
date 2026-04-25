import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import AuthSection from "@/components/public/auth/AuthSection";

import { ROUTES } from "@/api/constants/constants";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

import "@assets/scss/public/auth/auth.scss";
import { getDeviceId } from "@/utils/device";

const Register = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const { register } = useAuth();

  const navigate = useNavigate();

  const handleNext = async () => {
    const deviceId = await getDeviceId();

    if (!email || !password || !confirmPassword) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      const responseData = await register(email.trim(), password.trim(), deviceId);

      if (responseData?.success && responseData.next_step) {
        navigate(responseData.next_step);
      }
    } catch (e) {
      console.log("Error al registrar el paso 1:", e);
      toast.error("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
  };

  return (
    <AuthSection
      flex="flex"
      color="bg-yellow"
      title="Crear cuenta"
      subtitle="Completa tus datos para comenzar tus artes culinarias"
      children2={
        <>

          <div className="text-center text-[15px] flex items-center justify-center mt-3 gap-3 pb-4">
            <span className="text4">¿Tienes un local?</span>
            <Link
              to={ROUTES.AUTH.REGISTER_LOCAL}
              className="text5 underline cursor-pointer hover:text-red-600 font-bold"
            >
              Regístralo ahora
            </Link>
          </div>
        </>
      }
      background="right-background"
      Dform="Dform-right"
      items="items-end text-right"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
        className="flex flex-col gap-6"
      >
        {/* Campo de email */}
        <div className="mt-3">
          <p className="font-medium text-[15px] mb-2 text5">Email</p>
          <div className="relative">
            <input
              required
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="tu@email.com"
              className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:border-transparent focus:ring-[#E5A657] outline-none"
            />
          </div>
        </div>
        {/* Campo de contraseña */}
        <div>
          <p className="font-medium text-[15px] mb-2 text5">Contraseña</p>
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:border-transparent focus:ring-[#E5A657] outline-none pr-12"
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
        {/* Campo de confirmar contraseña */}
        <div>
          <p className="font-medium text-[15px] mb-2 text5">
            Confirmar contraseña
          </p>
          <div className="relative">
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Repite tu contraseña"
              className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E5A657] text-[15px] outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Mostrar mensaje de error si existe */}

        {/* Botón de registro */}
        <div className="mb-2">
          <button
            type="submit"
            className="Dosis-Bold w-full mb-3 text-[15px] cursor-pointer bg-yellow text-white py-[10px] mt-4 px-4 rounded-lg hover:bg-gray-900 transition-colors  font-medium"
          >
            Registrarse →
          </button>
        </div>
      </form>

      <p className="text-[12px] text4 text-center max-w-[400px] mx-auto mt-2">
        Al registrarte, aceptas los{" "}
        <span className="text-[#0a87da] cursor-pointer hover:underline">
          Términos de servicio
        </span>{" "}
        y la{" "}
        <span className="text-[#0a87da] cursor-pointer hover:underline">
          Política de privacidad
        </span>
        , incluida la política de{" "}
        <span className="text-[#0a87da] cursor-pointer hover:underline">
          Uso de Cookies.
        </span>
      </p>
    </AuthSection>
  );
};

export default Register;
