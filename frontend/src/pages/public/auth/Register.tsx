import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import AuthSection from "@/components/features/auth/AuthSection";

import { ROUTES } from "@/api/constants/constants";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

import "@assets/scss/public/auth.scss";
import { getDeviceId } from "@/utils/device";

const Register = () => {
  const [visible, setVisible] = useState({
    password: false,
    confirm: false,
  });

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { register } = useAuth();

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
      const response = await register(email.trim(), password.trim(), deviceId);

      if (response && response.token) {
        navigate(
          {
            pathname: ROUTES.AUTH.ONBOARDING,
            search: `?tempToken=${response.token}`,
          },
          {
            replace: true,
          },
        );
      }
    } catch (e: any) {
      console.log(e.response.data.error)
    }
  };

  return (
    <AuthSection
      flex="left"
      title="Crear cuenta"
      subtitle="Completa tus datos para comenzar tus artes culinarias"
      children2={
        <>
          <div className="text-center text-base flex items-center justify-center gap-x-3">
            <span className="text-text-4">¿Tienes un local?</span>
            <Link
              to={ROUTES.AUTH.REGISTER_LOCAL}
              className="text-text-3 underline cursor-pointer hover:text-[#B53325] font-bold"
            >
              Regístralo ahora
            </Link>
          </div>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
        className="flex flex-col justify-center gap-6"
      >
        {/* Campo de email */}
        <div className="mt-3">
          <p className="font-medium text-[15px] mb-2 text5">Email</p>
          <div className="relative">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type={visible.password ? "text" : "password"}
              value={password}
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:border-transparent focus:ring-[#E5A657] outline-none pr-12"
            />
            <button
              type="button"
              onClick={() =>
                setVisible({ ...visible, password: !visible.password })
              }
              className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {visible.password ? <EyeOff size={20} /> : <Eye size={20} />}
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
              type={visible.confirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Repite tu contraseña"
              className="w-full px-4 py-[10px] text5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E5A657] text-[15px] outline-none pr-12"
            />
            <button
              type="button"
              onClick={() =>
                setVisible({ ...visible, confirm: !visible.confirm })
              }
              className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {visible.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Botón de registro */}
        <button
          type="submit"
          className="w-full text-text-3 text-[16px] cursor-pointer border border-dashed border-bg-yellow hover:bg-[#e5a657] hover:text-text-1 py-[12px] mt-4 rounded-lg transition-colors font-medium"
        >
          Registrarse
        </button>

        <p className="text-sm text-text-6 text-center">
          Al registrarte, aceptas los{" "}
          <span className="text-bg-blue cursor-pointer hover:underline">
            Términos de servicio
          </span>{" "}
          y la{" "}
          <span className="text-bg-blue cursor-pointer hover:underline">
            Política de privacidad
          </span>
          , incluida la política de{" "}
          <span className="text-bg-blue cursor-pointer hover:underline">
            Uso de Cookies.
          </span>
        </p>
      </form>
    </AuthSection>
  );
};

export default Register;
