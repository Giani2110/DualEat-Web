import React, { useEffect, useState } from "react";
import AuthSection from "@/components/features/auth/AuthSection";

import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import { useAuth } from "@hooks/useAuth";

import { ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import "@assets/scss/public/auth.scss";
import { useQuery } from "@tanstack/react-query";
import { getFoodCategories, getTags } from "@/services/category.api";
import type { CommunityTag, FoodCategory } from "@/interface/global";

export default function Onboarding() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const tempToken = searchParams.get("tempToken");

  const [name, setName] = useState("");

  const [preferences, setPreferences] = useState<string[]>([]);

  const [index, setIndex] = useState(1);

  const { completeProfile } = useAuth();

  useEffect(() => {
    if (!tempToken) {
      toast.error("Error: Token temporal no encontrado.");
      navigate(-1);
    }
  }, [tempToken]);

  const { data: foodCategories = [], isLoading: loadingFood } = useQuery({
    queryKey: ["categories", "food"],
    queryFn: async () => {
      const response = await getFoodCategories();
      return response?.data as FoodCategory[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const { data: tagCategories = [], isLoading: loadingTags } = useQuery({
    queryKey: ["categories", "tags"],
    queryFn: async () => {
      const response = await getTags();
      return response?.data as CommunityTag[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const isLoading = loadingFood || loadingTags;

  const togglePreference = (id: string) => {
    setPreferences((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  console.log(preferences)

  const handleSubmit = async () => {
    if (index === 2 && (!name || preferences.length < 3)) {
      toast.error(
        "Completá tu nombre y elegí al menos 3 preferencias (entre comida y comunidades).",
      );
      return;
    }

    if (index === 1) {
      setIndex(2);
      return;
    }

    if (!tempToken) {
      toast.error("Error: Token temporal no encontrado.");
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
      return;
    }

    const foodPreferences = preferences.filter((id) =>
      foodCategories.some((c) => c.id === id),
    );
    const communityPreferences = preferences.filter((id) =>
      tagCategories.some((t) => t.id === id),
    );

    try {
      const response = await completeProfile(
        name,
        foodPreferences,
        communityPreferences,
        tempToken!,
      );

      if (response && response.success) {
        navigate(ROUTES.USER.DASHBOARD, { replace: true });
      }
    } catch (e) {
      console.log(e);
      toast.error("Error al completar el perfil. Intenta de nuevo más tarde.");
    }
  };

  return (
    <AuthSection
      flex="left"
      title="Personalizar perfil"
      subtitle="Completa tus datos para comenzar tus artes culinarias"
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
                    {foodCategories.map((category) => (
                      <button
                        key={`food-cat-${category.id}`}
                        type="button"
                        onClick={() => togglePreference(category.id)}
                        className={`scrollDiv border transition-colors
                          ${
                            preferences.includes(category.id)
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

              {index === 2 && tagCategories.length > 0 && (
                <div>
                  <h3 className="underline text-[14.5px] mb-3 text5">
                    Tags de Comunidad
                  </h3>
                  <div className="scroll grid-cols-2 md:grid-cols-3 gap-2 ">
                    {tagCategories.map((tag) => (
                      <button
                        key={`comm-tag-${tag.id}`}
                        type="button"
                        onClick={() => togglePreference(tag.id)}
                        className={`scrollDiv border transition-colors
                            ${
                              preferences.includes(tag.id)
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
  );
}
