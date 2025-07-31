// Onboarding.tsx
import React, { useState, useEffect } from "react";
import AuthSection from "../../components/auth/AuthSection";
import "../../assets/scss/auth/auth.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRegister } from "../../context/RegisterContext"; // Asegúrate de que este contexto tenga el tempToken

interface FoodCategory {
  id: number;
  name: string;
  tipo: 'Tipos_de_comida' | 'Estilos_o_dietas' | 'Origen_y_cultura';
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
  const { data: registerContextData } = useRegister(); // Asumimos que useRegister ahora proporciona 'data' que puede contener 'tempToken'

  const [name, setName] = useState<string>("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [communityTags, setCommunityTags] = useState<CommunityTag[]>([]);
  const [loadingPreferences, setLoadingPreferences] = useState<boolean>(true);
  const [errorPreferences, setErrorPreferences] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);

  useEffect(() => {
    // 1. Intentar obtener tempToken de la URL (para flujo de Google OAuth)
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('tempToken');

    if (tokenFromUrl) {
      setTempToken(tokenFromUrl);
    } else if (registerContextData?.tempToken) { // <--- ¡Asegúrate de que esto se esté leyendo!
      // 2. Si no está en la URL, intentar obtenerlo del contexto (para flujo de registro local)
      setTempToken(registerContextData.tempToken);
      // Opcional: Si el nombre también viene del contexto, inicializarlo
      if (registerContextData.name) {
        setName(registerContextData.name);
      }
    } else {
      console.warn("No se encontró tempToken en la URL ni en el contexto. El usuario no debería estar aquí directamente.");
      // Podrías redirigir al login o registro si no hay token
      // navigate("/login"); // Descomentar si quieres forzar la redirección
    }

    const fetchOnboardingData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/onboarding");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedData = await response.json();

        setFoodCategories(fetchedData.foodCategories || []);
        setCommunityTags(fetchedData.communityTags || []);
      } catch (error) {
        console.error("Error al obtener datos de onboarding:", error);
        setErrorPreferences("No se pudieron cargar las preferencias. Intenta de nuevo más tarde.");
      } finally {
        setLoadingPreferences(false);
      }
    };

    fetchOnboardingData();
  }, [location.search, registerContextData, navigate]); // Añadir navigate a las dependencias

  const togglePreference = (prefName: string) => {
    setPreferences((prev) =>
      prev.includes(prefName) ? prev.filter((p) => p !== prefName) : [...prev, prefName]
    );
  };

  const handleSubmit = async () => {
    if (!name || preferences.length < 3) {
      alert("Completá tu nombre y elige al menos 3 preferencias (entre comida y comunidades).");
      return;
    }

    // Asegurarse de que tenemos un tempToken antes de enviar
    if (!tempToken) {
        alert("Error: Token de registro no encontrado. Por favor, intenta registrarte de nuevo.");
        navigate("/register"); // Redirigir al inicio del registro
        return;
    }

    const foodPreferenceIds = preferences
      .map(prefName => foodCategories.find(cat => cat.name === prefName)?.id)
      .filter(id => id !== undefined) as number[];

    const communityPreferenceIds = preferences
      .map(prefName => communityTags.find(tag => tag.name === prefName)?.id)
      .filter(id => id !== undefined) as number[];

    const payload = {
      tempToken: tempToken, // Enviar el token temporal (ahora puede venir del contexto o URL)
      name,
      foodPreferences: foodPreferenceIds,
      communityPreferences: communityPreferenceIds,
    };

    try {
      const response = await fetch("http://localhost:3000/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al completar perfil.");
      }

      console.log("Perfil completado con éxito:", responseData);

      if (responseData.accessToken) {
        // Redirigir a la ruta del backend que establece la cookie y luego redirige al dashboard
        // Utilizamos replace para que el usuario no pueda volver a la página de onboarding con el token temporal
        navigate(`/set-cookie-and-redirect?token=${responseData.accessToken}`, { replace: true });
      } else {
        alert("Registro completado, pero no se recibió un token de sesión.");
        navigate("/login");
      }

    } catch (error: any) {
      console.error("Error al enviar datos de completado de perfil:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const tiposDeComida = foodCategories.filter(cat => cat.tipo === 'Tipos_de_comida');
  const estilosODietas = foodCategories.filter(cat => cat.tipo === 'Estilos_o_dietas');
  const origenYCultura = foodCategories.filter(cat => cat.tipo === 'Origen_y_cultura');

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
      {/* Campo de nombre de usuario */}
      <div>
        <div className="font-medium text-[15px] mb-2 text5">Nombre de usuario</div>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            placeholder="Nombre de usuario"
            className="w-full px-4 py-[10px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5A657] focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Sección principal para elegir preferencias (Categorías de comida y Tags de comunidad) */}
      <div className="mt-6 w-full">
        <div className="font-medium text-[15px] mb-2 text5">
          Preferencias
        </div>
        <div className="font-normal text-[13px] mb-2 text-gray-600">
          Elige al menos 3
          {preferences.length > 0 && ` (${preferences.length}/3)`}
        </div>

        {loadingPreferences ? (
          <p>Cargando preferencias...</p>
        ) : errorPreferences ? (
          <p className="text-red-500">{errorPreferences}</p>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Bloque de Categorías de Comida */}
            <div>
              <h3 className="font-semibold text-base mb-3 text-gray-800">
                Categorías de Comida
              </h3>
              <div className="h-64 overflow-y-auto pr-2 custom-scrollbar border rounded-lg p-3 bg-white shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tiposDeComida.map((category) => (
                    <button
                      key={`food-cat-${category.id}`}
                      type="button"
                      onClick={() => togglePreference(category.name)}
                      className={`px-3 py-2 rounded-full border text-[13px] text-center transition-colors
                        ${preferences.includes(category.name)
                          ? "bg-yellow text-white border-yellow"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                  {estilosODietas.map((category) => (
                    <button
                      key={`food-cat-${category.id}`}
                      type="button"
                      onClick={() => togglePreference(category.name)}
                      className={`px-3 py-2 rounded-full border text-[13px] text-center transition-colors
                        ${preferences.includes(category.name)
                          ? "bg-yellow text-white border-yellow"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                  {origenYCultura.map((category) => (
                    <button
                      key={`food-cat-${category.id}`}
                      type="button"
                      onClick={() => togglePreference(category.name)}
                      className={`px-3 py-2 rounded-full border text-[13px] text-center transition-colors
                        ${preferences.includes(category.name)
                          ? "bg-yellow text-white border-yellow"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bloque de Tags de Comunidad */}
            {communityTags.length > 0 && (
              <div>
                <h3 className="font-semibold text-base mb-3 text-gray-800">
                  Tags de Comunidad
                </h3>
                <div className="h-48 overflow-y-auto pr-2 custom-scrollbar border rounded-lg p-3 bg-white shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {communityTags.map((tag) => (
                      <button
                        key={`comm-tag-${tag.id}`}
                        type="button"
                        onClick={() => togglePreference(tag.name)}
                        className={`px-3 py-2 rounded-full border text-[13px] text-center transition-colors
                          ${preferences.includes(tag.name)
                            ? "bg-yellow text-white border-yellow"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón de registro */}
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full cursor-pointer bg-yellow text-white py-[10px] mt-4 px-4 rounded-lg hover:bg-gray-900 transition-colors text-[16px] font-medium"
      >
        Registrarse →
      </button>
      <div className="text-center text-[15px] flex items-center justify-center mt-6 gap-3">
        <span className="text4">¿Ya tienes cuenta?</span>
        <Link
          to={"/login"}
          className="text5 underline cursor-pointer hover:text-red-600 font-bold"
        >
          Inicia sesión en DualEat
        </Link>
      </div>
    </AuthSection>
  );
};

export default Onboarding;
