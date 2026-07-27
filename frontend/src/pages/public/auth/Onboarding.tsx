import React, { useEffect, useState } from "react";
import AuthSection from "@/components/features/auth/AuthSection";

import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import { useAuth } from "@hooks/useAuth";

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
        className="flex flex-col gap-3"
      >
       
          <h1 className="text-base text-text-3 font-bold">
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
      

        <div className="mt-10 w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-base mb-2 font-bold text-text-3">Preferencias</h1>
            <div className="flex gap-2 text-sm text-text-5">
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
            {[1, 2].map((i) => (
              <div
                key={`dot-${i}`}
                onClick={() => setIndex(i)}
                className={`
                  ${index === i ? "bg-bg-yellow text-white" : "bg-[#dbdbdb]"}
                  cursor-pointer mt-4 p-[5px] w-[40px] font-bold text-xs text-center rounded-[5px]`}
              >
                {i}
              </div>
            ))}
          </div>
        </div>

        {/* Botón de registro */}
        <button
          type="submit"
          className="w-full mt-4 flex gap-x-2 items-center justify-center text-text-1 text-sm cursor-pointer bg-bg-yellow hover:scale-103 duration-200 transition-all py-3 rounded-sm font-bold"
        >
          {index === 2 ? "Finalizar" : "Siguiente"}
        </button>
      </form>
    </AuthSection>
  );
}
