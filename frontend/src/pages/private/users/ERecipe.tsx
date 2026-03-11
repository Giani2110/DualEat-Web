import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInterceptor } from "@api/interceptor/axios-interceptor";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { useAuth } from "@hooks/useAuth";

import { Search, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";

import LogoIA from "@assets/images/icon/DualIA.avif";

import { capitalize, pluralize, getMimeTypeFromUrl } from "@utils/capitalize";

import { getRecipeNutrition } from "@services/recipes.api";
import { askRecipe } from "@/services/chat.api";

import { Pie, PieChart } from "recharts";

import type { Recipe, ChatSessionData } from "@interface/global";

import "@assets/scss/private/users/users.scss";
import Loader from "@components/animation/Loader";
import { ROUTES } from "@/api/constants/constants";

// Función para calcular el tiempo de lectura
const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
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
  const { user } = useAuth();
  const { communitySlug, recipeSlug, userSlug } = useParams<{
    communitySlug: string;
    recipeSlug: string;
    userSlug: string;
  }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [readingTime, setReadingTime] = useState<number>(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [conversation, setConversation] = useState<ChatSessionData[]>([]);
  const [started, setStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [nutritionData, setNutritionData] = useState<NutritionData | null>(
    null,
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [actualIndex, setActualIndex] = useState<number>(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const macronutrients = [
    {
      key: "carbs",
      label: "Carbohidratos",
      color: "#46999F",
      value: nutritionData?.avg_carbs,
    },
    {
      key: "fat",
      label: "Grasas",
      color: "#EE7D5F",
      value: nutritionData?.avg_fat,
    },
    {
      key: "proteins",
      label: "Proteínas",
      color: "#FDC343",
      value: nutritionData?.avg_proteins,
    },
  ];

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
          navigate(ROUTES.ERROR, { replace: true });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate(ROUTES.ERROR, { replace: true });
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
        const ingredientNames = recipe.ingredients.map(
          (i) => i.ingredient?.name,
        ) as string[];

        const nutritionData = await getRecipeNutrition(ingredientNames);

        const proteins = Number(nutritionData?.avg_proteins) || 0;
        const carbs = Number(nutritionData?.avg_carbs) || 0;
        const fats = Number(nutritionData?.avg_fat) || 0;

        setNutritionData({
          total_ingredients: nutritionData?.total_ingredients ?? 0,
          avg_calories: String(nutritionData?.avg_calories ?? ""),
          avg_proteins: String(nutritionData?.avg_proteins ?? ""),
          avg_carbs: String(nutritionData?.avg_carbs ?? ""),
          avg_fat: String(nutritionData?.avg_fat ?? ""),
          details:
            nutritionData && Array.isArray(nutritionData.details)
              ? nutritionData.details
              : [],
          total: Number(proteins + carbs + fats) || 0,
        });
      } catch (error) {
        console.error("Error al obtener los valores nutricionales:", error);
      }
    };

    fetchNutrition();
  }, [recipe]);

  useEffect(() => {
    const container = endRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation]);

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

  const parseBoldText = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, i) => {
      const safePart = part ?? ""; // asegura que no sea undefined

      if (safePart.startsWith("**") && safePart.endsWith("**")) {
        return <strong key={i}>{safePart.slice(2, -2)}</strong>;
      }

      return <span key={i}>{safePart}</span>;
    });
  };

  const handleAskQuestion = async () => {
    if (!search.trim() || !recipe) return;

    setStarted(true);
    setIsLoading(true);
    setConversation((prev) => [...prev, { text: search, role: "USER" }]);

    try {
      const response = await askRecipe(search, recipe.id, conversation);

      if (response?.success && response.comment) {
        const aiResponses: ChatSessionData[] = Array.isArray(response.comment)
          ? response.comment.map((c: ChatSessionData) => ({
              text: c.text,
              role: "IA",
            }))
          : [{ text: response.comment, role: "IA" }];

        setConversation((prev) => [...prev, ...aiResponses]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-[95%] md:w-[80%] md:max-w-[1000px] lg:max-w-[1300px] flex-wrap mx-auto flex flex-col lg:flex-row gap-3 my-5 ">
      {recipe ? (
        <>
          <div className="w-full md:flex-[1] lg:flex-[3] relative">
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

            <>
              <div className="flex gap-3 items-start">
                <img
                  src={
                    recipe.posts?.[0]?.community?.image_url ||
                    "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                  }
                  alt="Imagen de la comunidad"
                  className="h-9 w-9 rounded-full object-cover"
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
                      },
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

              <div className="w-full mt-8 border border-[#dbdbdb] bg-[#ffffffd2] px-8 py-5 rounded-[15px]">
                <h1 className="text-[30px] Dosis-Bold text5 tracking-tight">
                  {recipe.name}
                </h1>

                {/* Imagen principal de la receta */}
                {recipe.main_image && (
                  <>
                    <a
                      href={recipe.main_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-[5/3] mt-3 overflow-hidden rounded-sm relative"
                    >
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
                    </a>
                    <div className="flex items-center justify-center gap-3 my-5 py-1 text-[14px] text5 border-t border-b border-[#dbdbdb]">
                      <span className="bg-red Dosis-Bold text1 px-3 rounded-[2px]">
                        RECETAS
                      </span>
                      <span className="text-[18px]">•</span>
                      <span>{readingTime} MIN DE LECTURA</span>
                      <span className="text-[18px]">•</span>
                      <span>{recipe.total_time} MIN DE PREPARACIÓN</span>
                    </div>
                  </>
                )}
                <h2 className="text-[20px] Dosis-Bold text5 mb-2">
                  Descripción
                </h2>
                <p className="text5 text-[17px] mt-2 tracking-tight">
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
                      <div className="w-full h-[1px] bg-[#414141] mb-3" />
                      <ul className="list-disc list-inside">
                        {recipe.ingredients.map((ingredient, index) => {
                          return (
                            <li
                              key={index}
                              className="text5 flex justify-between text-[15px] py-1 border-b border-[#e0e0e0] mb-2 pb-2 mt-1 tracking-tight"
                            >
                              <span className="Dosis-Bold">
                                {capitalize(
                                  String(ingredient.ingredient?.name),
                                )}
                              </span>
                              <div className="relative flex items-center gap-3">
                                <span className="text4 text-[15px]">
                                  {ingredient.quantity}{" "}
                                  {pluralize(
                                    String(ingredient.unit_of_measure?.name),
                                    Number(ingredient.quantity),
                                  )}{" "}
                                  ({ingredient.unit_of_measure?.abbreviation})
                                </span>

                                {ingredient.notes && (
                                  <>
                                    <button
                                      type="button"
                                      title="Ver notas del ingrediente"
                                      className="cursor-pointer hover:scale-105 transition-all duration-100"
                                      onMouseEnter={() =>
                                        setHoveredIndex(index)
                                      }
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

                {/** Pasos */}
                <div>
                  {recipe.steps && (
                    <div className="mt-6">
                      <h2 className="text-[20px] Dosis-Bold text5 mb-2">
                        Pasos{" "}
                        <span className="text4 text-[13px] Dosis-Medium">
                          ({recipe.steps.length})
                        </span>
                      </h2>
                      <div className="w-full h-[1px] bg-[#414141] mb-3" />
                      <ol className="list-decimal list-inside">
                        {recipe.steps.map((step, index) => {
                          const type = getMimeTypeFromUrl(
                            String(step.image_url),
                          );

                          return (
                            <li
                              key={index}
                              onClick={() => setActualIndex(index)}
                              className={`text5 w-full px-2 overflow-hidden h-full flex justify-between text-[15px] border-b border-[#e0e0e0] py-3 tracking-tight group
                              ${
                                index === actualIndex
                                  ? "max-h-[500px]"
                                  : "max-h-[100px] cursor-pointer hover:bg-[#b53325]"
                              }
                              `}
                            >
                              {actualIndex === index ? (
                                <div className="flex flex-col w-full">
                                  <span className="Dosis-Bold text-[16px] flex-[1] items-baseline">
                                    Paso {step.step_number}
                                  </span>

                                  <div className="flex flex-col md:flex-row gap-3 justify-between">
                                    <div className="flex h-full flex-[1] flex-col justify-between">
                                      <p className="max-h-[200px] overflow-y-auto scroll2 pe-4 pb-4">
                                        {step.description}
                                      </p>
                                      {step.estimated_time != 0 && (
                                        <p className="Dosis-Bold pt-2">
                                          Tiempo estimado: {step.estimated_time}{" "}
                                          min
                                        </p>
                                      )}
                                    </div>

                                    <div className="w-full min-w-[200px] flex-[0.5] flex flex-col justify-between">
                                      {step.image_url ? (
                                        type === "video" ? (
                                          <video
                                            controls
                                            preload="metadata"
                                            className="w-full h-auto rounded-md"
                                          >
                                            <source src={step.image_url} />
                                          </video>
                                        ) : type === "audio" ? (
                                          <audio controls className="w-full">
                                            <source src={step.image_url} />
                                          </audio>
                                        ) : (
                                          <a
                                            href={step.image_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full aspect-[5/3] mt-3 overflow-hidden rounded-sm relative block"
                                          >
                                            {/* Contenido de la imagen... */}
                                            <div
                                              className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-50"
                                              style={{
                                                backgroundImage: `url(${step.image_url})`,
                                              }}
                                            />
                                            <img
                                              loading="lazy"
                                              className="w-full h-full object-contain cursor-pointer relative z-10"
                                              alt="Imagen del post"
                                              src={step.image_url}
                                            />
                                          </a>
                                        )
                                      ) : (
                                        step.image_url !== null && (
                                          <Loader size="4" color="black" />
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="items-center flex w-full">
                                  <span className="Dosis-Bold flex-[0.1] group-hover:text-[#FFFFFF]">
                                    {step.step_number}
                                  </span>
                                  <div className="flex-[4] h-[1px] group-hover:border-[#FFFFFF] border-dotted border-[#2c2c2c] border-b-2" />
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ol>

                      {/** Buttons para pasar de paso */}
                      <div className="w-full flex justify-between mt-6">
                        <button
                          title="Paso anterior"
                          onClick={() => {
                            if (actualIndex > 0) {
                              setActualIndex(actualIndex - 1);
                            }
                          }}
                          type="button"
                          className="text-[13px] gap-2 group flex items-center justify-between text3 tracking-tight border border-[#b53325]  hover:bg-[#b53325] px-3 py-1 rounded-[5px] cursor-pointer"
                        >
                          <ChevronLeft className="w-6 h-6 text-red group-hover:text-[#FFFFFF]!" />
                          <h1 className="text-[16px] text-red group-hover:text-[#FFFFFF]!">
                            Paso anterior
                          </h1>
                        </button>
                        <button
                          title="Paso siguiente"
                          onClick={() => {
                            if (actualIndex < recipe.steps.length - 1) {
                              setActualIndex(actualIndex + 1);
                            }
                          }}
                          type="button"
                          className="text-[13px] gap-2 group flex items-center justify-between text3 tracking-tight border border-[#b53325]  hover:bg-[#b53325] px-3 py-1 rounded-[5px] cursor-pointer"
                        >
                          <ChevronRight className="w-6 h-6 text-red group-hover:text-[#FFFFFF]!" />
                          <h1 className="text-[16px] text-red group-hover:text-[#FFFFFF]!">
                            Paso siguiente
                          </h1>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/** Valor nutricional */}
                {nutritionData && nutritionData.total_ingredients > 0 && (
                  <div className="mt-18">
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
                            className="z-10 mx-auto"
                          >
                            <Pie
                              tabIndex={-1}
                              data={[
                                {
                                  name: "Proteínas",
                                  value:
                                    Number(nutritionData?.avg_proteins) || 0,
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
                          {macronutrients.map(
                            ({ key, label, color, value }) => (
                              <div
                                key={key}
                                className="flex flex-col leading-7 items-center md:items-start max-w-[150px] flex-1"
                              >
                                <span className="Dosis-Bold" style={{ color }}>
                                  {value && nutritionData?.total
                                    ? (
                                        (Number(value) / nutritionData.total) *
                                        100
                                      ).toFixed(0)
                                    : "0"}
                                  %
                                </span>
                                <span className="text5 text-[22px] Dosis-Bold">
                                  {value ? Number(value).toFixed(1) : "0"}g
                                </span>
                                <span className="text6 text-[14px]">
                                  {label}
                                </span>
                                <div
                                  className="w-full max-w-20 mt-2 h-[3px] rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                      <div className="max-w-[600px] text-center mx-auto">
                        <p className="mt-5 text-[14px] text4">
                          Este tipo de visualización nutricional ofrece una
                          forma clara y accesible de entender cómo se
                          distribuyen los macronutrientes en una receta.Se
                          representa el aporte relativo de carbohidratos, grasas
                          y proteínas en términos de calorías.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          </div>

          {/** CHAT */}
          <div className="w-full md:flex-[1] lg:flex-[2] border border-[#dbdbdb] bg-[#ffffffd2] h-fit px-4 py-5 rounded-[15px] mt-10 lg:mt-18 flex flex-col lg:max-w-[400px]">
            <div className="flex justify-between gap-2 items-center border-b border-[#dbdbdb] pb-3 px-2">
              <h3 className="Dosis-Bold text5 text-[17px] tracking-tight">
                Chat con DualIA
              </h3>
              <button
                type="button"
                onClick={() => {
                  setStarted(false);
                  setConversation([]);
                }}
                className="px-2 py-1 rounded-[6px] bg-[#2F2F2F] hover:scale-103 transition-all duration-100 text1 tracking-tight text-[15px] flex gap-2 items-center cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-bot-message-square-icon lucide-bot-message-square"
                >
                  <path d="M12 6V2H8" />
                  <path d="M15 11v2" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
                  <path d="M9 11v2" />
                </svg>
                Nuevo chat
              </button>
            </div>

            {started ? (
              <div
                ref={endRef}
                className="flex flex-col gap-6 overflow-y-auto max-h-[400px] px-5 py-3"
              >
                {conversation.map((msg, index) => {
                  const isExpanded = expandedIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() =>
                        setExpandedIndex(isExpanded ? null : index)
                      }
                      className={`flex cursor-pointer items-start ${
                        msg.role === "USER" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role !== "USER" && (
                        <img
                          src={LogoIA}
                          className="rounded-full max-w-7 max-h-7 me-2"
                          alt="Logo DualIA"
                        />
                      )}
                      <div
                        className={`max-w-[70%] lg:w-full p-2 rounded-[8px] bg-[#ffffffcc] shadow-md border text5 text-[15px] ${
                          msg.role === "USER"
                            ? "text-right border-[#4A4947]!"
                            : "text-left border-[#dbdbdb]"
                        }
                    ${isExpanded ? "line-clamp-none" : "line-clamp-2"}
                    `}
                      >
                        {parseBoldText(msg.text)}
                      </div>
                      {msg.role === "USER" && (
                        <img
                          src={
                            user?.avatar_url ||
                            "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
                          }
                          className="rounded-full max-w-7 max-h-7 ms-2"
                          alt="Imagen de usuario"
                        />
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex gap-2 items-center">
                    <Loader size="4" color="gray-500" />
                    <p className="text4 text-[15px]">Cargando respuesta...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col text-center tracking-tight justify-center items-center gap-y-4 py-3 mt-10">
                <img
                  src={LogoIA}
                  className="max-w-12 max-h-12 mx-auto"
                  alt="Imagen de DualIA"
                />
                <h1 className="text-[22px] Dosis-Bold underline">
                  Bienvenido a DualIA
                </h1>
                <p className="text4">
                  DualIA te ayuda a resolver dudas sobre esta receta:
                  ingredientes, pasos, nutrición o adaptaciones. Escribí tu
                  pregunta y recibí una respuesta clara al instante.
                </p>
              </div>
            )}

            {/** TEXTAREA + BUTTON */}
            <div className="w-full mt-4">
              <div className="flex shadow-md shadow-[#f1f1f1] justify-between cursor-text rounded-[10px] bg-[#ffffffcb] border-[#dbdbdb] p-2 border mx-auto">
                <textarea
                  ref={textareaRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                      setSearch("");
                      if (textareaRef.current) {
                        textareaRef.current.style.height = "auto";
                      }
                    }
                  }}
                  placeholder="Pregunta a DualIA"
                  rows={1}
                  className="placeholder:text-[#4A4947] resize-none overflow-y-auto scroll2 placeholder:tracking-tight break-words text5 outline-0 w-full px-2"
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  }}
                />

                <div className="flex justify-end h-fit">
                  <button
                    type="button"
                    onClick={() => {
                      handleAskQuestion();
                      setSearch("");
                      if (textareaRef.current) {
                        textareaRef.current.style.height = "auto";
                      }
                    }}
                    className="p-2 rounded-full bg-[#b53325] cursor-pointer"
                  >
                    {search ? (
                      <ArrowUp size={20} color="#ffffff" />
                    ) : (
                      <Search size={20} color="#ffffff" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text5 text-[15px] mt-2 tracking-tight">
          Cargando receta...
        </p>
      )}
    </section>
  );
};
export default ERecipe;
