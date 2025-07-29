import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import AuthSection from "../../components/auth/AuthSection";

import { Link } from "react-router-dom";

import "../../assets/scss/auth/auth.scss";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <AuthSection
      flex="flex-row-reverse"
      color="bg-red"
      title="Bienvenido de nuevo"
      subtitle=" Ingresa a tu cuenta y conecta con tu comida, como nunca antes"
      children2={
        <div className="text-center text-[15px] flex items-center justify-center mt-6 gap-3">
          <span className="text4">¿No tienes cuenta? </span>
          <Link
            to={"/register"}
            className="text5 underline cursor-pointer hover:text-red-600 font-bold"
          >
            Regístrate en DualEat
          </Link>
        </div>
      }
      background="left-background"
      Dform="Dform"
    >
      {/* Campo de email */}
      <div>
        <div className="font-medium text-[15px] mb-2 text5">Email</div>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="tu@email.com"
            className="w-full px-4 py-[10px] border border-gray-300 rounded-[8px] focus:ring-2 focus:ring-[#E5A657] focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Campo de contraseña */}
      <div>
        <div className="font-medium text-[15px] mb-2 text5">Contraseña</div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="••••••••"
            className="w-full px-4 py-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5A657] focus:border-transparent outline-none pr-12"
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

      {/* Recordarme y olvidé contraseña */}
      <div className="flex items-center justify-between mt-[30px]">
        <div className="flex items-center">
          <input
            placeholder="Recuérdame"
            type="checkbox"
            checked={rememberMe}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRememberMe(e.target.checked)
            }
            className="w-4 h-4 cursor-pointer border-gray-300 rounded focus:ring-[#B53325]"
          />
          <span className="ml-2 text-[15px]">Recuérdame</span>
        </div>
        <button
          type="button"
          className="text-[#822621] text-[15px] cursor-pointer underline hover:text-red-600"
        >
          ¿Olvidé mi contraseña?
        </button>
      </div>

      {/* Botón de inicio de sesión */}
      <button
        type="submit"
        onClick={() => console.log("Login clicked")}
        className="w-full bgsemi-black text-white py-[10px] px-4 rounded-lg transition-all duration-300 cursor-pointer  font-medium"
      >
        Iniciar Sesión →
      </button>
    </AuthSection>
  );
};

export default Login;
