import React, { useState, useEffect } from "react";
import AuthSection from "../../components/auth/AuthSection";
import { axiosInterceptor } from "../../interceptor/axios-interceptor";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants/constants";
import { useAuth } from "../../hooks/useAuth";

import { ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import "../../assets/scss/auth/auth.scss";

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
const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState<string>("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [communityTags, setCommunityTags] = useState<CommunityTag[]>([]);
  const [loadingPreferences, setLoadingPreferences] = useState<boolean>(true);
  const [errorPreferences, setErrorPreferences] = useState<string | null>(null);
  const [index, setIndex] = useState(1);

  const { completeProfile } = useAuth();

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const response = await axiosInterceptor.get("/api/onboarding");

        const fetchedData = await response.data;

        setFoodCategories(fetchedData.foodCategories || []);
        setCommunityTags(fetchedData.communityTags || []);
      } catch (error) {
        console.error("Error al obtener datos de onboarding:", error);
        setErrorPreferences(
          "No se pudieron cargar las preferencias. Intenta de nuevo más tarde."
        );
      } finally {
        setLoadingPreferences(false);
      }
    };

    fetchOnboardingData();
  }, []);

  const togglePreference = (prefName: string) => {
    setPreferences((prev) => {
      const isSelected = prev.includes(prefName);
      let updated = [];

      if (isSelected) {
        updated = prev.filter((p) => p !== prefName);
      } else {
        updated = [...prev, prefName];
        const existsInBoth =
          foodCategories.some((c) => c.name === prefName) &&
          communityTags.some((t) => t.name === prefName);

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
        "Completá tu nombre y elegí al menos 3 preferencias (entre comida y comunidades)."
      );
      return;
    }
    const queryParams = new URLSearchParams(location.search);
    const tempToken = queryParams.get("tempToken");

    if (!tempToken) {
      toast.error("Token temporal no encontrado. Por favor, vuelve a registrarte.");
      navigate(ROUTES.AUTH.REGISTER);
      return;
    }

    if (index === 1) {
      setIndex(2);
      return;
    }

    const foodPreferenceIds = preferences
      .map(
        (prefName) => foodCategories.find((cat) => cat.name === prefName)?.id
      )
      .filter((id) => id !== undefined) as number[];

    const communityPreferenceIds = preferences
      .map((prefName) => communityTags.find((tag) => tag.name === prefName)?.id)
      .filter((id) => id !== undefined) as number[];

    try {
      const responseData = await completeProfile(
        name,
        foodPreferenceIds,
        communityPreferenceIds,
        tempToken
      );

      if (responseData?.success) {
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(
          "Error al completar el perfil. Intenta de nuevo más tarde."
        );
      }
    } catch (error: unknown) {
      console.error("Error al enviar datos de completado de perfil:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  };

  return (
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

          {loadingPreferences ? (
            <p>Cargando preferencias...</p>
          ) : errorPreferences ? (
            <p className="text-red-500">{errorPreferences}</p>
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

              {index === 2 && communityTags.length > 0 && (
                <div>
                  <h3 className="underline text-[14.5px] mb-3 text5">
                    Tags de Comunidad
                  </h3>
                  <div className="scroll grid-cols-2 md:grid-cols-3 gap-2 ">
                    {communityTags.map((tag) => (
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
  );
};

export default Onboarding;
