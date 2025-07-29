import React, { useState } from "react";


import AuthSection from "../../components/auth/AuthSection";

import "../../assets/scss/auth/auth.scss";

import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../context/RegisterContext";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const { data } = useRegister();

  const [name, setName] = useState<string>("");
  const [preferences, setPreferences] = useState<string[]>([]);

  const togglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = async () => {
    if (!name || preferences.length < 3) {
      alert("Completá tu nombre y al menos 3 preferencias.");
      return;
    }

    const fullData = {
      ...data,
      name,
      preferences,
    };

    
  };

  return (
    <AuthSection
      flex="flex"
      color="bg-yellow"
      title="Personalizar perfil"
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
      {/* Campo de nombre de usuario */}
      <div>
        <div className="font-medium text-[15px] mb-2 text5">Email</div>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            placeholder="tu@email.com"
            className="w-full px-4 py-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5A657] focus:border-transparent outline-none"
          />
        </div>
      </div>
     

      {/* Botón de registro */}
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full cursor-pointer bg-yellow text-white py-[10px] mt-4 px-4 rounded-lg hover:bg-gray-900 transition-colors text-[16px] font-medium"
      >
        Finalizar registro →
      </button>
    </AuthSection>
  );
};

export default Onboarding;
