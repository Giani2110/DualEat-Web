import React, { useState, useEffect } from "react";

import AuthSection from "../../components/auth/AuthSection";

import "../../assets/scss/auth/auth.scss";

import { Link } from "react-router-dom";
import { useRegister } from "../../context/RegisterContext";

interface FoodCategory {
  id: number;
  name: string;
  tipo: 'Tipos_de_comida' | 'Estilos_o_dietas' | 'Origen_y_cultura';
}

interface CommunityTag {
  id: number;
  name: string;
  // Puedes añadir más propiedades de CommunityTag si las necesitas, por ejemplo category
  category?: {
    id: number;
    name: string;
  };
}

const Onboarding: React.FC = () => {
  const { data } = useRegister();

  const [name, setName] = useState<string>("");
  const [preferences, setPreferences] = useState<string[]>([]); // Para almacenar los nombres de las preferencias seleccionadas
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [communityTags, setCommunityTags] = useState<CommunityTag[]>([]);
  const [loadingPreferences, setLoadingPreferences] = useState<boolean>(true);
  const [errorPreferences, setErrorPreferences] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        // Asegúrate de que esta URL coincida con tu configuración de rutas en el backend
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
  }, []);

  const togglePreference = (prefName: string) => {
    setPreferences((prev) =>
      prev.includes(prefName) ? prev.filter((p) => p !== prefName) : [...prev, prefName]
    );
  };

  const handleSubmit = async () => {
    // Puedes ajustar la validación si se requieren 3 preferencias en total (comida + tags)
    // o 3 de cada tipo. Aquí asumimos 3 en total.
    if (!name || preferences.length < 3) {
      alert("Completá tu nombre y elige al menos 3 preferencias (entre comida y comunidades).");
      return;
    }

    const fullData = {
      ...data,
      name,
      preferences, // Esto enviará los nombres de las preferencias seleccionadas
    };

    console.log("Datos completos del usuario:", fullData);
    alert("¡Registro finalizado con éxito! (Esto es solo una simulación)");
    // navigate("/dashboard");
  };
  
  // Filtrar categorías de comida por tipo
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2"> {/* Puedes ajustar a grid-cols-4 si los nombres son cortos */}
                  {/* Renderiza Tipos de comida */}
                  {tiposDeComida.map((category) => (
                    <button
                      key={`food-cat-${category.id}`} // Clave única
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
                  {/* Renderiza Estilos o Dietas */}
                  {estilosODietas.map((category) => (
                    <button
                      key={`food-cat-${category.id}`} // Clave única
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
                  {/* Renderiza Origen y Cultura */}
                  {origenYCultura.map((category) => (
                    <button
                      key={`food-cat-${category.id}`} // Clave única
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2"> {/* Ajusta las columnas según sea necesario */}
                    {communityTags.map((tag) => (
                      <button
                        key={`comm-tag-${tag.id}`} // Clave única
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