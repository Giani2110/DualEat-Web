import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ChartBarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShoppingCart,
  Star,
} from "lucide-react";

import { capitalize } from "@utils/capitalize";

import { getRecipeById } from "@/services/recipe.api";

import {
  UnitNames,
  type NutritionData,
  type Recipe,
  type RecipeIngredient,
  type RecipeStep,
} from "@interface/global";

import "@assets/scss/private/users/users.scss";
import Loader from "@/components/ui/feedback/Loader";
import { useQuery } from "@tanstack/react-query";
import NutritionPie from "@/components/features/recipe/NutritionPie";

export default function RecipeDetail() {
  const navigate = useNavigate();

  const { recipe_id } = useParams<{ recipe_id: string }>();

  const [nutrition, setNutrition] = useState<NutritionData | null>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [actualIndex, setActualIndex] = useState<number>(0);

  let rating: number = 0;

  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recipe", recipe_id],

    queryFn: async () => {
      const response = await getRecipeById(recipe_id as string);
      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta del post");
      }
      return response.data as Recipe;
    },

    enabled: !!recipe_id,

    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (recipe) {
      navigate(`/r/${recipe.id}/${recipe.slug}`, { replace: true });
    }
  }, [recipe, navigate]);

  useEffect(() => {
    if (!recipe?.ingredients) return;

    let totalFat = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalCalories = 0;

    for (const item of recipe.ingredients) {
      const rawQuantity = Number(item.quantity) || 0;
      const ing = item.ingredient;

      if (!ing) continue;

      let weightInGrams = 0;

      switch (item.unit) {
        case "GRAMOS":
        case "MILILITROS":
          weightInGrams = rawQuantity;
          break;

        case "KILOGRAMOS":
        case "LITROS":
          weightInGrams = rawQuantity * 1000;
          break;

        case "CUCHARADITA":
          weightInGrams = rawQuantity * 5;
          break;

        case "CUCHARADA":
          weightInGrams = rawQuantity * 15;
          break;

        case "TAZA":
          weightInGrams = rawQuantity * 240;
          break;

        case "PIZCA":
          weightInGrams = rawQuantity * 0.5;
          break;

        case "UNIDAD":
          weightInGrams = rawQuantity * 100;
          break;

        case "PAQUETE":
          weightInGrams = rawQuantity * 400;
          break;

        case "OPCIONAL":
          weightInGrams = rawQuantity > 0 ? rawQuantity * 10 : 0;
          break;

        default:
          weightInGrams = rawQuantity;
          break;
      }

      const factor = weightInGrams / 100;

      totalFat += (ing.fat || 0) * factor;
      totalCarbs += (ing.carbs || 0) * factor;
      totalProtein += (ing.proteins || 0) * factor;
      totalCalories += (ing.calories || 0) * factor;
    }

    const totalMacros = totalProtein + totalCarbs + totalFat;

    setNutrition({
      total_ingredients: recipe.ingredients.length,
      avg_calories: Math.round(totalCalories),
      avg_proteins: Number(totalProtein.toFixed(1)),
      avg_carbs: Number(totalCarbs.toFixed(1)),
      avg_fat: Number(totalFat.toFixed(1)),
      total: Number(totalMacros.toFixed(1)),
    });
  }, [recipe]);


  if (recipe) {
    const votes_up = recipe.votes_up ?? 0;
    const votes_down = recipe.votes_down ?? 0;
    const total_votes = votes_up + votes_down;
    rating = total_votes > 0 ? (votes_up / total_votes) * 5 : 0;
  }

  const recipeStats = [
    {
      id: "time",
      icon: <Clock size={16} color="#707070" />,
      text: `${recipe?.total_time ?? 0}min`,
    },
    {
      id: "ingredients",
      icon: <ShoppingCart size={16} color="#707070" />,
      text: `${recipe?.ingredients?.length ?? 0} ingredientes`,
    },
    {
      id: "steps",
      icon: <ChartBarIcon size={16} color="#707070" />,
      text: `${recipe?.steps?.length ?? 0} pasos`,
    },
  ];

  const renderStepButton = useCallback(
    (step: RecipeStep, index: number) => {
      const isActive = index === actualIndex;
      const stepId = `recipe-step-content-${index}`;
      const triggerId = `recipe-step-trigger-${index}`;

      return (
        <div key={index} className="border-b border-text-2 w-full">
          <button
            id={triggerId}
            type="button"
            onClick={() => setActualIndex(index)}
            aria-expanded={isActive}
            aria-controls={stepId}
            className={`w-full text-text-5 text-base p-2 text-left transition-all duration-300 flex flex-row items-center gap-x-2 group ${
              isActive
                ? "font-bold"
                : "cursor-pointer hover:bg-[#e5a657] hover:text-white group-hover:border-white"
            }`}
          >
            <span className="font-bold">Paso {step.step_number}</span>
            {!isActive && (
              <div className="flex-1 group-hover:border-white h-[1px] border-dotted border-[#2c2c2c] border-b-2" />
            )}
          </button>

          {isActive && (
            <div
              id={stepId}
              role="region"
              aria-labelledby={triggerId}
              className="flex flex-col items-start gap-y-2 w-full h-auto px-2 pb-3 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <p
                tabIndex={0}
                className="max-h-[200px] text-start text-base text-text-4 h-auto overflow-y-auto outline-none rounded p-1"
              >
                {step.description}
              </p>

              {step.estimated_time !== 0 && (
                <p className="font-bold text-sm text-text-5">
                  Tiempo estimado: {step.estimated_time} min
                </p>
              )}
            </div>
          )}
        </div>
      );
    },
    [actualIndex],
  );

  const renderIngredientItem = useCallback(
    (ingredient: RecipeIngredient, index: number) => {
      return (
        <li
          key={index}
          className="flex flex-col md:flex-row justify-between text-sm py-1 border-b border-text-2"
        >
          <span className="font-bold text-text-5">
            {capitalize(String(ingredient.ingredient?.name))}
          </span>
          <div className="relative flex items-center gap-x-3">
            <span className="text-text-4 flex-1">
              {ingredient.quantity} {UnitNames[ingredient.unit].abbreviation} (
              {UnitNames[ingredient.unit].name})
            </span>

            {ingredient.notes && (
              <>
                <button
                  type="button"
                  title="Ver notas del ingrediente"
                  className="cursor-pointer hover:scale-105 transition-all duration-100"
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
    },
    [hoveredIndex],
  );

  const sortedSteps = useMemo(
    () => recipe?.steps?.sort((a, b) => a.step_number - b.step_number) || [],
    [recipe?.steps],
  );

  if (isLoading) {
    return (
      <section className="h-full w-full flex items-center justify-center">
        <Loader color={"#e5a657"} size={30} />
      </section>
    );
  }

  if (!recipe) {
    return <Navigate to="/404" replace />;
  }

  return (
    <section className="h-full px-8 flex-wrap mx-auto flex flex-col md:flex-row gap-8 my-5 bg-bg-semi-white">
      <main style={{ flex: 2 }} className="flex flex-col gap-y-4">
        <header className="flex gap-x-5 items-start">
          <div className="flex flex-row gap-x-4 items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              title="Volver atrás"
              className="bg-bg-gray rounded-full w-8 h-8 flex items-center justify-center border border-[#f5f5f5] cursor-pointer transition-all duration-300 ease-in-out group hover:bg-bg-red"
            >
              <ArrowLeft
                size={20}
                className="text-[#707070] transition-colors duration-300 group-hover:text-white"
              />
            </button>
            <img
              src={
                recipe.user.avatar_url
                  ? recipe.user.avatar_url
                  : "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
              }
              alt="Imagen de perfil"
              className="w-8 h-8 rounded-full"
              loading="lazy"
            />
            <div className="flex flex-col">
              <p className="text-[12px] text-text-6">Hecha por:</p>
              <p className="font-bold text-[14px] text-text-3">
                {recipe.user.name}
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap flex-row gap-x-4 items-center">
          <h1 className="text-[28px] font-bold text-text-3 tracking-tight">
            {recipe.name}
          </h1>
          <div className="flex flex-row items-center gap-x-1">
            <Star size={16} fill="#e5a657" color="#e5a657" />

            <span className="font-bold text-[16px] text-text-3">
              {rating === 0 ? "N/A" : `${rating.toFixed(1)}`}
            </span>
          </div>
        </div>

        {/* Imagen principal de la receta */}
        {recipe.main_image && (
          <a
            href={recipe.main_image}
            target="_blank"
            title="Ver la imagen en tamaño completo"
            rel="noopener noreferrer"
            className="block w-auto h-auto aspect-[6/4] lg:aspect-[6/2] overflow-hidden rounded-[10px] relative"
          >
            <div
              className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-30"
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
        )}

        <div className="flex flex-wrap flex-row items-center justify-center gap-x-6 py-1 border-y border-[#dbdbdb]">
          {recipeStats.map((stat, index) => (
            <div key={stat.id} className="flex items-center gap-x-4">
              {stat.icon}
              <span className="font-light text-sm text-text-4">
                {stat.text}
              </span>
              {index !== recipeStats.length - 1 && (
                <span className="text-[18px]">•</span>
              )}
            </div>
          ))}
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-y-2">
          <h2 className="text-[20px] font-bold text-text-5">Descripción</h2>
          <p className="text-text-5 text-[16px] tracking-tight">
            {recipe.description}
          </p>
        </div>

        {/** Ingredientes */}
        {recipe.ingredients && (
          <div className="flex flex-col gap-y-4">
            <div className="flex items-baseline gap-x-2">
              <h2 className="text-[20px] font-bold text-text-5">
                Ingredientes
              </h2>
              <span className="text-text-4 text-[12px]">
                {recipe.ingredients.length + " en total"}
              </span>
            </div>

            <ul className="flex flex-col gap-y-4 list-disc list-inside">
              {recipe.ingredients.map(renderIngredientItem)}
            </ul>
          </div>
        )}

        {/** Pasos */}
        {recipe.steps && (
          <div className="flex flex-col gap-y-4">
            <div className="flex items-baseline gap-x-2">
              <h2 className="text-[20px] font-bold text-text-5">Pasos</h2>
              <span className="text-text-4 text-[12px]">
                {recipe.steps.length + " pasos"}
              </span>
            </div>

            <div className="flex flex-col gap-y-4">
              {sortedSteps.map(renderStepButton)}
            </div>

            {/** Buttons para pasar de step */}
            <div className="w-full flex flex-row justify-between">
              {["Paso anterior", "Paso siguiente"].map((text, index) => (
                <button
                  key={index}
                  title={text}
                  disabled={
                    index === 0
                      ? actualIndex === 0
                      : actualIndex === recipe.steps.length - 1
                  }
                  onClick={() => {
                    if (index === 0) {
                      if (actualIndex > 0) {
                        setActualIndex(actualIndex - 1);
                      }
                    } else {
                      if (actualIndex < recipe.steps.length - 1) {
                        setActualIndex(actualIndex + 1);
                      }
                    }
                  }}
                  type="button"
                  className="gap-x-2 disabled:cursor-not-allowed disabled:opacity-50 group flex items-center border border-bg-red hover:bg-[#b53325] px-4 py-1 rounded-[5px] cursor-pointer"
                >
                  {index === 0 ? (
                    <ChevronLeft className="w-4 h-4 text-red group-hover:text-[#FFFFFF]!" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-red group-hover:text-[#FFFFFF]!" />
                  )}
                  <h1 className="text-[14px] text-red group-hover:text-[#FFFFFF]!">
                    {text}
                  </h1>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <aside style={{ flex: 1 }}>
        {nutrition && nutrition.total_ingredients > 0 && (
          <NutritionPie nutrition={nutrition} />
        )}
      </aside>
    </section>
  );
}
