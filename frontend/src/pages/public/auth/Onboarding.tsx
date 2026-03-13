import React, { useState } from "react";
import AuthSection from "@/components/public/auth/AuthSection";

import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import { useAuth } from "@hooks/useAuth";

import { ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import "@assets/scss/public/auth/auth.scss";
import { useQuery } from "@tanstack/react-query";
import {
  getFoodCategories,
  getTagCategories,
} from "@/services/community-tag.api";

interface FoodCategory {
  id: number;
  name: string;
  tipo: "Tipos_de_comida" | "Estilos_o_dietas" | "Origen_y_cultura";
}

interface CommunityTag {
  id: number;
  name: string;
  category?: {
    id: number;
    name: string;
  };
}
const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState<string>("");

  const [preferences, setPreferences] = useState<string[]>([]);

  const [index, setIndex] = useState(1);

  const { completeProfile } = useAuth();

  const { data: foodCategories = [], isLoading: loadingFood } = useQuery({
    queryKey: ["categories", "food"],
    queryFn: async () => {
      const response = await getFoodCategories();
      return response?.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const { data: tagCategories = [], isLoading: loadingTags } = useQuery({
    queryKey: ["categories", "tags"],
    queryFn: async () => {
      const response = await getTagCategories();
      return response?.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const foodC: FoodCategory[] = (foodCategories as FoodCategory[]) || [];
  const communityC: CommunityTag[] = (tagCategories as CommunityTag[]) || [];

  const isLoading = loadingFood || loadingTags;

  const togglePreference = (prefName: string) => {
    setPreferences((prev) => {
      const isSelected = prev.includes(prefName);
      let updated = [];

      if (isSelected) {
        updated = prev.filter((p) => p !== prefName);
      } else {
        updated = [...prev, prefName];
        const existsInBoth =
          foodC.some((c) => c.name === prefName) &&
          communityC.some((t) => t.name === prefName);

        if (existsInBoth && !updated.includes(prefName)) {
          updated.push(prefName);
        }
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (index === 2 && (!name || preferences.length < 3)) {
      toast.error(
        "Completá tu nombre y elegí al menos 3 preferencias (entre comida y comunidades).",
      );
      return;
    }
    const queryParams = new URLSearchParams(location.search);
    const tempToken = queryParams.get("tempToken");

    if (!tempToken) {
      toast.error(
        "Token temporal no encontrado. Por favor, vuelve a registrarte.",
      );
      navigate(ROUTES.AUTH.REGISTER);
      return;
    }

    if (index === 1) {
      setIndex(2);
      return;
    }

    const foodPreferenceIds = preferences
      .map((prefName) => foodC.find((cat) => cat.name === prefName)?.id)
      .filter((id) => id !== undefined) as number[];

    const communityPreferenceIds = preferences
      .map((prefName) => communityC.find((tag) => tag.name === prefName)?.id)
      .filter((id) => id !== undefined) as number[];

    try {
      const response = await completeProfile(
        name,
        foodPreferenceIds,
        communityPreferenceIds,
        tempToken,
      );
      if (response?.success) {
        navigate(ROUTES.USER.DASHBOARD, { replace: true });
      }
    } catch (e) {
      console.log(e);
      toast.error("Error al completar el perfil. Intenta de nuevo más tarde.");
    }
  };

  return (
    <>
      <AuthSection
        flex="flex"
        color="bg-yellow"
        title="Personalizar perfil"
        subtitle="Completa tus datos para comenzar tus artes culinarias"
        background="right-background"
        Dform="Dform-right"
        items="items-end text-right"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-6"
        >
          <div>
            <h1 className="mt-5 underline text-[15px] mb-4 text5">
              Nombre de usuario
            </h1>
            <div>
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="Nombre de usuario"
                className="w-full px-4 text6 text-[15px] py-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5A657] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="mt-10 w-full">
            <div className="flex justify-between items-center">
              <h1 className="text-[15px] mb-2 text5">Preferencias</h1>
              <div className="text6 flex gap-5 text-[15px] text-gray-600">
                <span>Elige al menos 3</span>
                <span className="font-bold text-yellow">
                  {`${preferences.length} / 3`}
                </span>
              </div>
            </div>

            {isLoading ? (
              <p>Cargando preferencias...</p>
            ) : (
              <div className="flex cat-block flex-col gap-6 mt-4">
                {index === 1 && (
                  <div>
                    <h3 className="underline text-[14.5px] mb-3 text5">
                      Categorías de Comida
                    </h3>
                    <div className="scroll grid-cols-2 md:grid-cols-3 gap-2">
                      {foodC.map((category) => (
                        <button
                          key={`food-cat-${category.id}`}
                          type="button"
                          onClick={() => togglePreference(category.name)}
                          className={`scrollDiv border transition-colors
                          ${
                            preferences.includes(category.name)
                              ? "text-yellow border-yellow"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {index === 2 && communityC.length > 0 && (
                  <div>
                    <h3 className="underline text-[14.5px] mb-3 text5">
                      Tags de Comunidad
                    </h3>
                    <div className="scroll grid-cols-2 md:grid-cols-3 gap-2 ">
                      {communityC.map((tag) => (
                        <button
                          key={`comm-tag-${tag.id}`}
                          type="button"
                          onClick={() => togglePreference(tag.name)}
                          className={`scrollDiv border transition-colors
                            ${
                              preferences.includes(tag.name)
                                ? "text-yellow border-yellow"
                                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                            }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center mt-4">
              <ArrowLeft
                type="button"
                size={26}
                onClick={() => setIndex(1)}
                className={`
                ${index === 1 ? "bg-yellow text-white" : "bg-[#dbdbdb]"}
                cursor-pointer mt-4 p-[5px] w-[40px] rounded-[5px] transition-colors`}
              />

              <ArrowRight
                type="button"
                size={26}
                onClick={() => setIndex(2)}
                className={`
                ${index === 2 ? "bg-yellow text-white" : "bg-[#dbdbdb]"}
                cursor-pointer mt-4 p-[5px] w-[40px] rounded-[5px] transition-colors`}
              />
            </div>
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-yellow text-white py-[10px] mt-4 px-4 rounded-lg hover:bg-gray-900 transition-colors text-[15px] font-medium"
          >
            {index === 2 ? "Finalizar" : "Siguiente"}
          </button>
        </form>
      </AuthSection>
    </>
  );
};

export default Onboarding;
