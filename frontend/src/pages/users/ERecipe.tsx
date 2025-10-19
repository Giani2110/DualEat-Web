import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInterceptor } from "../../interceptor/axios-interceptor";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { capitalize, pluralize } from "../../utils/capitalize";

import { getRecipeNutrition } from "../../services/recipes.api";

import { Pie, PieChart } from "recharts";

import type { Recipe } from "../../interface/global";

// Función para calcular el tiempo de lectura
const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200; // Velocidad promedio de lectura
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes);
};

type NutritionData = {
  total_ingredients: number;
  avg_calories: string;
  avg_proteins: string;
  avg_carbs: string;
  avg_fat: string;
  details: {
    ingredient: string;
    found: boolean;
    energy_kcal?: undefined;
    proteins?: undefined;
    carbohydrates?: undefined;
    fat?: undefined;
  }[];
  total: number;
};

const ERecipe = () => {
  const navigate = useNavigate();
  const { communitySlug, recipeSlug, userSlug } = useParams<{
    communitySlug: string;
    recipeSlug: string;
    userSlug: string;
  }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [readingTime, setReadingTime] = useState<number>(1);

  const [nutritionData, setNutritionData] = useState<NutritionData | null>(
    null
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!communitySlug || !recipeSlug || !userSlug) {
      navigate(-1);
    }

    const fetchData = async () => {
      try {
        const response = await axiosInterceptor.get(`/recipe/slug`, {
          params: { communitySlug, recipeSlug, userSlug },
        });
        if (response.data.success) {
          setRecipe(response.data.data);
        } else {
          navigate(-1);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [communitySlug, recipeSlug, userSlug, navigate]);

  useEffect(() => {
    if (recipe) {
      const time = getRecipeReadingTime(recipe);
      setReadingTime(time);
    }
  }, [recipe]);

  useEffect(() => {
    const fetchNutrition = async () => {
      if (!recipe?.ingredients) return;

      try {
        // obtenemos nombres de los ingredientes
        const ingredientNames = recipe.ingredients.map(
          (i) => i.ingredient?.name
        ) as string[];

        // llamamos a la API o función local
        const nutritionData = await getRecipeNutrition(ingredientNames);

        console.log(nutritionData);

        const proteins = Number(nutritionData?.avg_proteins) || 0;
        const carbs = Number(nutritionData?.avg_carbs) || 0;
        const fats = Number(nutritionData?.avg_fat) || 0;

        setNutritionData({
          ...nutritionData,
          total: Number(proteins + carbs + fats),
        });
      } catch (error) {
        console.error("Error al obtener los valores nutricionales:", error);
      }
    };

    fetchNutrition();
  }, [recipe]);

  // Función para obtener todo el texto de la receta
  const getRecipeReadingTime = (recipe: Recipe): number => {
    let fullText = "";

    if (recipe.name) fullText += recipe.name + " ";
    if (recipe.description) fullText += recipe.description + " ";

    // Agregar ingredientes si existen
    if (recipe.ingredients) {
      if (Array.isArray(recipe.ingredients)) {
        fullText += recipe.ingredients.join(" ") + " ";
      } else if (typeof recipe.ingredients === "string") {
        fullText += recipe.ingredients + " ";
      }
    }

    // Agregar instrucciones si existen
    if (recipe?.steps) {
      if (Array.isArray(recipe.steps)) {
        fullText += recipe.steps.join(" ") + " ";
      } else if (typeof recipe.steps === "string") {
        fullText += recipe.steps + " ";
      }
    }

    return calculateReadingTime(fullText);
  };

  return (
    <section className="w-[95%] md:w-[80%] md:max-w-[1000px] lg:max-w-[1200px] mx-auto flex flex-col gap-3 px-2 py-1 mt-5">
      <div className="w-full md:flex-[1] lg:flex-[3] max-w-3xl relative">
        <div className="h-fit hidden md:block absolute -left-11 top-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Volver atrás"
            className="bg-gray rounded-full p-1.5 border border-[#dbdbdb] cursor-pointer hover:border-[#888888] hover:bg-[#dbdbdb]!"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height={20}
              width={20}
              viewBox="0 0 640 640"
            >
              <path
                fill="#4A4947"
                d="M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z"
              />
            </svg>
          </button>
        </div>

        {recipe ? (
          <>
            <div className="flex gap-3 items-start">
              <img
                src={
                  recipe.posts?.[0]?.community?.image_url ||
                  "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                }
                alt="Imagen de la comunidad"
                className="w-full h-full max-h-8.5 max-w-8.5 rounded-full object-cover"
              />
              <div className="flex flex-col leading-5">
                <span className="text-[15px] text5 Dosis-Bold">
                  {recipe.posts?.[0]?.community?.slug}
                </span>
                <span className="text-[14px] text4">
                  {recipe.posts?.[0]?.user?.name}
                </span>
              </div>
              <span className="w-[4px] h-[4px] rounded-full bg-[#707070] mt-2" />
              {recipe.created_at &&
              !isNaN(new Date(recipe.created_at).getTime()) ? (
                <span
                  title={format(
                    new Date(recipe.created_at),
                    "d 'de' MMMM 'de' yyyy",
                    {
                      locale: es,
                    }
                  )}
                  className="text-[13px] text4 flex"
                >
                  {formatDistanceToNow(new Date(recipe.created_at), {
                    locale: es,
                    addSuffix: true,
                  })}
                </span>
              ) : (
                <span className="text-[13px] text4">Fecha inválida</span>
              )}
            </div>

            <div className="mt-8">
              <h1 className="text-[38px] Dosis-Bold text5 tracking-tight">
                {recipe.name}
              </h1>

              {/* Imagen principal de la receta */}
              {recipe.main_image && (
                <>
                  <div className="aspect-[5/4] mt-3 overflow-hidden rounded-sm relative">
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-50"
                      style={{
                        backgroundImage: `url(${recipe.main_image})`,
                      }}
                    />

                    <img
                      className="w-full h-full object-contain cursor-pointer relative z-10"
                      alt="Imagen del post"
                      src={recipe.main_image}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-3 my-8 text-[18px] text-gray-700 font-medium">
                    <span className=" text-gray-400">〰〰〰</span>
                    <span className="bg-red Dosis-Bold text1 px-3 rounded-[2px]">
                      RECETAS
                    </span>

                    <span className="text-[18px]">•</span>
                    <span>{readingTime} MIN DE LECTURA</span>
                    <span className=" text-gray-400">〰〰〰</span>
                  </div>
                </>
              )}

              <p className="text5 text-[18px] mt-2 tracking-tight">
                {recipe.description}
              </p>

              {/** Ingredientes */}
              <div>
                {recipe.ingredients && (
                  <div className="mt-6">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-[20px] Dosis-Bold text5 mb-2">
                        Ingredientes
                      </h2>
                      <span className="text4 text-[13px]">
                        {recipe.ingredients.length + " ingredientes"}{" "}
                      </span>
                    </div>
                    <ul className="list-disc list-inside">
                      {recipe.ingredients.map((ingredient, index) => {
                        return (
                          <li
                            key={index}
                            className="text5 flex justify-between text-[15px] py-1 border-b border-[#e0e0e0] mb-2 pb-2 mt-1 tracking-tight"
                          >
                            <span className="Dosis-Bold">
                              {capitalize(String(ingredient.ingredient?.name))}
                            </span>
                            <div className="relative flex items-center gap-3">
                              <span className="text4 text-[15px]">
                                {ingredient.quantity}{" "}
                                {pluralize(
                                  String(ingredient.unit_of_measure?.name),
                                  Number(ingredient.quantity)
                                )}
                              </span>

                              {ingredient.notes && (
                                <>
                                  <button
                                    type="button"
                                    title="Ver notas del ingrediente"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      height={20}
                                      width={20}
                                      viewBox="0 0 512 512"
                                    >
                                      <path
                                        fill="#4A4947"
                                        d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm0-336c-17.7 0-32 14.3-32 32 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-44.2 35.8-80 80-80s80 35.8 80 80c0 47.2-36 67.2-56 74.5l0 3.8c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-8.1c0-20.5 14.8-35.2 30.1-40.2 6.4-2.1 13.2-5.5 18.2-10.3 4.3-4.2 7.7-10 7.7-19.6 0-17.7-14.3-32-32-32zM224 368a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                                      />
                                    </svg>
                                  </button>

                                  {hoveredIndex === index && (
                                    <div className="absolute bottom-full mb-2 w-max bg-gray text-[15px] text5 rounded-md p-2 border border-[#c0c0c0] shadow-lg z-20">
                                      {ingredient.notes}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/** Valor nutricional */}
              {nutritionData && (
                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-[20px] Dosis-Bold text5 mb-2">
                      Información Nutricional Aproximada
                    </h2>
                    <span className="text4 text-[13px]">
                      cada 100g de receta
                    </span>
                  </div>

                  <div className="mt-5 bg-gray py-4 px-3 rounded-[10px] border border-[#e0e0e0] w-full">
                    <div className="flex gap-5 flex-wrap">
                      <div className="relative flex-[1]">
                        <PieChart
                          width={250}
                          height={150}
                          tabIndex={-1}
                          className="z-10"
                        >
                          <Pie
                            tabIndex={-1}
                            data={[
                              {
                                name: "Proteínas",
                                value: Number(nutritionData?.avg_proteins) || 0,
                                fill: "#FDC343",
                              },
                              {
                                name: "Carbohidratos",
                                value: Number(nutritionData?.avg_carbs) || 0,
                                fill: "#46999F",
                              },
                              {
                                name: "Grasas",
                                value: Number(nutritionData?.avg_fat) || 0,
                                fill: "#EE7D5F",
                              },
                            ]}
                            paddingAngle={2}
                            isAnimationActive={true}
                            innerRadius="80%"
                            cornerRadius="30%"
                            outerRadius="100%"
                            label
                          />
                        </PieChart>

                        <div className="absolute top-1/2 leading-5 flex flex-col left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                          <span className="Dosis-Bold text5 text-[24px]">
                            {Number(nutritionData.avg_calories).toFixed(0)}
                          </span>
                          <span className="Dosis-Bold text6 text-[14px]">
                            Cals
                          </span>
                        </div>
                      </div>
                      <div className="flex-[2] flex min-w-[150px] mt-3 md:mt-0">
                        <div className="flex flex-col leading-7 max-w-[150px] flex-1">
                          <span className="text-[#46999F] Dosis-Bold">
                            {nutritionData &&
                              (
                                (Number(nutritionData.avg_carbs) /
                                  nutritionData.total) *
                                100
                              ).toFixed(0)}
                            %
                          </span>
                          <span className="text5 text-[22px] Dosis-Bold">
                            {Number(nutritionData.avg_carbs).toFixed(1)}g
                          </span>
                          <span className="text6 text-[14px]">
                            Carbohidratos
                          </span>
                          <div className="max-w-20 mt-2 h-[3px] rounded-full bg-[#46999F]" />
                        </div>

                        <div className="flex flex-col leading-7 max-w-[150px] flex-1">
                          <span className="text-[#EE7D5F] Dosis-Bold">
                            {nutritionData &&
                              (
                                (Number(nutritionData.avg_fat) /
                                  nutritionData.total) *
                                100
                              ).toFixed(0)}
                            %
                          </span>
                          <span className="text5 text-[22px] Dosis-Bold">
                            {Number(nutritionData.avg_fat).toFixed(1)}g
                          </span>
                          <span className="text6 text-[14px]">Grasas</span>
                          <div className="max-w-20 mt-2 h-[3px] rounded-full bg-[#EE7D5F]" />
                        </div>
                        <div className="flex flex-col leading-7 max-w-[150px] flex-1">
                          <span className="text-[#FDC343] Dosis-Bold">
                            {nutritionData &&
                              (
                                (Number(nutritionData.avg_proteins) /
                                  nutritionData.total) *
                                100
                              ).toFixed(0)}
                            %
                          </span>
                          <span className="text5 text-[22px] Dosis-Bold">
                            {Number(nutritionData.avg_proteins).toFixed(1)}g
                          </span>
                          <span className="text6 text-[14px]">Proteínas</span>
                          <div className="max-w-20 mt-2 h-[3px] rounded-full bg-[#FDC343]" />
                        </div>
                      </div>
                    </div>
                    <div className="max-w-[600px] text-center mx-auto">
                      <p className="mt-5 text-[14px] text4">
                        Este tipo de visualización nutricional ofrece una forma
                        clara y accesible de entender cómo se distribuyen los
                        macronutrientes en una receta.Se representa el aporte
                        relativo de carbohidratos, grasas y proteínas en
                        términos de calorías.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text5 text-[15px] mt-2 tracking-tight">
            Cargando receta...
          </p>
        )}
      </div>
    </section>
  );
};
export default ERecipe;
