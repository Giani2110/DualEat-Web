import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import AuthSection from "../../components/auth/AuthSection";

import "../../assets/scss/auth/auth.scss";

import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../context/RegisterContext";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null); // Nuevo estado para manejar errores

  const { updateData } = useRegister();

  const navigate = useNavigate();

  const handleNext = async () => { // Cambiado a async
    setError(null); // Limpiar errores anteriores

    if (!email || !password || !confirmPassword) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Registro exitoso del paso 1
        // Guardar el email y el temp_token en el contexto
        updateData({ 
            email: email, 
            tempToken: responseData.temp_token // <--- ¡Asegúrate de que esto se esté guardando!
        }); 
        navigate(responseData.next_step); // Redirigir a /onboarding (que es lo que devuelve el backend)
      } else {
        // Manejar errores del backend (ej. email ya existe - status 409)
        setError(responseData.message || "Ocurrió un error en el registro.");
      }
    } catch (err) {
      console.error("Error al registrar el paso 1:", err);
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
  };

  return (
    <AuthSection
      flex="flex"
      color="bg-yellow"
      title="Crear cuenta"
      subtitle="Completa tus datos para comenzar tus artes culinarias"
      children2={
        <div className="text-center text-[15px] flex items-center justify-center mt-6 gap-3">
          <span className="text4">¿Ya tienes cuenta?</span>
          <Link
            to={"/login"}
            className="text5 underline cursor-pointer hover:text-red-600 font-bold"
          >
            Inicia sesión en DualEat
          </Link>
        </div>
      }
      background="right-background"
      Dform="Dform-right"
      items="items-end text-right"
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
            className="w-full px-4 py-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5A657] focus:border-transparent outline-none"
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
      {/* Campo de confirmar contraseña */}
      <div>
        <div className="font-medium text-[15px] mb-2 text5">
          Confirmar contraseña
        </div>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Repite tu contraseña"
            className="w-full px-4 py-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5A657] text-[15px] focus:border-transparent outline-none pr-12"
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
      {error && (
        <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
      )}
      {/* Botón de registro */}
      <button
        type="button"
        onClick={handleNext}
        className="w-full cursor-pointer bg-yellow text-white py-[10px] mt-4 px-4 rounded-lg hover:bg-gray-900 transition-colors text-[16px] font-medium"
      >
        Registrarse →
      </button>
    </AuthSection>
  );
};

export default Register;
