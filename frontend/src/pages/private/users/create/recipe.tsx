import StepsList from "@/components/features/create/recipe/StepsList";
import NutritionPie from "@/components/features/recipe/NutritionPie";
import IngredientsModal from "@/components/shared/IngredientsModal";
import { usePostCreateStore } from "@/context/store/usePostCreate";
import { useIngredients } from "@/hooks/api/recipe/useIngredients";
import {
  Unit,
  UnitList,
  UnitNames,
  type Ingredient,
  type NutritionData,
} from "@/interface/global";
import type {
  PostDTO,
  RecipeDTO,
  RecipeIngredientDTO,
  RecipeStepDTO,
  UploadableFile,
  UploadPayload,
} from "@/interface/global.dto";
import { capitalize } from "@/utils/capitalize";
import { pickMedia } from "@/utils/media";
import {
  ChartBarIcon,
  Clock,
  FileImage,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createPost, upload } from "@/services/post.api";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import toast from "react-hot-toast";

type RecipePartial = Omit<RecipeDTO, "ingredients" | "steps">;

type StepsPartial = { id: string } & RecipeStepDTO;

export default function CreateRecipe() {
  const { post, clearPost } = usePostCreateStore();

  console.log(post);

  const [nutrition, setNutrition] = useState<NutritionData | null>(null);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"Ingredientes" | "Unidades">("Ingredientes");

  const { data, isLoading } = useIngredients(true);

  const indexIngredient = useRef<number | null>(null);
  const indexStep = useRef<number | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [ingredients, setIngredients] = useState<RecipeIngredientDTO[]>([
    {
      ingredient: null,
      quantity: "",
      unit: Unit.GRAMOS,
      notes: "",
    },
  ]);

  const [steps, setSteps] = useState<StepsPartial[]>([
    {
      id: crypto.randomUUID(),
      step_number: 1,
      description: "",
      estimated_time: null,
    },
  ]);

  const total = useMemo(() => {
    return steps.reduce((acc, step) => acc + (step.estimated_time || 0), 0);
  }, [steps]);

  const [recipe, setRecipe] = useState<RecipePartial>({
    name: "",
    description: "",
    total_time: total,
    main_image: "",
  });

  useEffect(() => {
    setRecipe((prev) => ({ ...prev, total_time: total }));
  }, [total]);

  useEffect(() => {
    if (post.title === "" || post.content === "" || !post.community) {
      navigate(ROUTES.USER.CREATE_POST);
    }
  }, [post]);

  const handleFiles = (
    files: File[],
    type: "image" | "video",
    selected: "main_image" | "step",
  ) => {
    const media = pickMedia(files, type);
    if (media.length === 0) return;

    if (selected === "main_image") {
      setRecipe({ ...recipe, main_image: media[0] });
    } else if (selected === "step") {
      setSteps((prev) =>
        prev.map((item, i) =>
          i === indexStep.current ? { ...item, image_url: media[0] } : item,
        ),
      );
    }
  };

  const [isDragOver, setIsDragOver] = useState(false);

  const navigate = useNavigate();

  const { mutate: submitRecipe, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      const uploadPayload: UploadPayload = {
        post_images: post.image_urls as UploadableFile[],
        main_image: recipe.main_image as UploadableFile,
      };

      const response = await upload(uploadPayload);

      if (!response.success) {
        toast.error(response.message || "Error al subir los archivos");
        return;
      }

      const urls = response.data;

      const postDTO: PostDTO = {
        title: post.title.trim(),
        content: post.content.trim(),
        image_urls: urls?.post_images || [],
        community: post.community,
      };

      const recipeDTO: RecipeDTO = {
        name: recipe.name.trim(),
        description: recipe.description.trim(),
        total_time: recipe.total_time,
        main_image: urls?.main_image || "",
        ingredients: ingredients.map((ingredient) => {
          return {
            ...ingredient,
            ingredient_id: Number(ingredient.ingredient?.id),
            notes: ingredient.notes?.trim() || "",
          };
        }),
        steps: steps.map((step): RecipeStepDTO => {
          return {
            ...step,
            description: step.description.trim(),
          };
        }),
      };

      const createResponse = await createPost(postDTO, recipeDTO);

      return createResponse;
    },
    onMutate: () => {
      toast.loading("Publicando receta...");
    },
    onSuccess: (res) => {
      toast.dismiss();
      toast.success(res?.message || "Receta publicada exitosamente");
      clearPost();
      navigate(
        ROUTES.USER.POST(res?.data?.id as string, res?.data?.slug as string),
      );
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error(err.message || "Error al publicar la receta");
    },
  });

  const handleSubmit = async () => {
    if (!recipe.name || !recipe.description || !recipe.main_image) {
      toast.error("Faltan datos en la receta");
      return;
    }

    if (
      ingredients.some(
        (ingredient) =>
          !ingredient.ingredient || !ingredient.quantity || !ingredient.unit,
      )
    ) {
      return;
    }

    if (steps.some((step) => !step.description)) {
      toast.error("Faltan datos en los pasos");
      return;
    }

    submitRecipe();
  };

  const sections = useMemo(() => {
    switch (type) {
      case "Ingredientes":
        return (
          <IngredientsModal
            ingredients={data || []}
            isLoading={isLoading}
            onSelectIngredient={(ing) => handleSelect(ing)}
          />
        );
      case "Unidades":
        return (
          <section className="flex flex-1 flex-col gap-y-4 overflow-y-auto">
            {UnitList.map((unit: Unit) => (
              <button
                key={unit}
                onClick={() => handleSelectUnit(unit)}
                className="cursor-pointer text-[14px] py-1.5 border border-gray-300 rounded-[4px] text-text-5"
              >
                {capitalize(UnitNames[unit].name)} (
                {UnitNames[unit].abbreviation})
              </button>
            ))}
          </section>
        );
      default:
        break;
    }
  }, [type, isLoading]);

  const recipeStats = [
    {
      id: "time",
      icon: <Clock size={16} color="#707070" />,
      text: `${recipe?.total_time ?? 0}min`,
    },
    {
      id: "ingredients",
      icon: <ShoppingCart size={16} color="#707070" />,
      text: `${ingredients?.length ?? 0} ingredientes`,
    },
    {
      id: "steps",
      icon: <ChartBarIcon size={16} color="#707070" />,
      text: `${steps?.length ?? 0} pasos`,
    },
  ];

  const handleSelect = (ingredient: Ingredient) => {
    setIngredients((prev) =>
      prev.map((item, i) =>
        i === indexIngredient.current
          ? {
              ...item,
              ingredient: ingredient,
            }
          : item,
      ),
    );
    setOpen(false);
  };

  const handleSelectUnit = (selectedUnit: Unit) => {
    const target = indexIngredient.current;

    if (target !== null) {
      setIngredients((prev) =>
        prev.map((item, i) =>
          i === target ? { ...item, unit: selectedUnit } : item,
        ),
      );
    }

    setOpen(false);
  };

  const handleModal = (index: number, type: "unit" | "ingredient") => {
    indexIngredient.current = index;

    if (type === "unit") setType("Unidades");
    if (type === "ingredient") setType("Ingredientes");

    setOpen(true);
  };

  const isSubmitDisabled = useMemo(() => {
    const invalidIngredient = ingredients.some(
      (item) => !item.ingredient || !item.quantity.trim(),
    );

    const invalidStep = steps.some((step) => !step.description.trim());

    const invalidRecipe =
      !recipe.name.trim() || !recipe.description.trim() || !recipe.main_image;

    return invalidIngredient || invalidStep || invalidRecipe;
  }, [ingredients, steps, recipe]);

  useEffect(() => {
    if (!ingredients) return;

    let totalFat = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalCalories = 0;

    for (const item of ingredients) {
      const rawQuantity = Number(item.quantity) || 0;

      if (!item) continue;

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

      totalFat += (item.ingredient?.fat || 0) * factor;
      totalCarbs += (item.ingredient?.carbs || 0) * factor;
      totalProtein += (item.ingredient?.proteins || 0) * factor;
      totalCalories += (item.ingredient?.calories || 0) * factor;
    }

    const totalMacros = totalProtein + totalCarbs + totalFat;

    setNutrition({
      total_ingredients: ingredients.length,
      avg_calories: Math.round(totalCalories),
      avg_proteins: Number(totalProtein.toFixed(1)),
      avg_carbs: Number(totalCarbs.toFixed(1)),
      avg_fat: Number(totalFat.toFixed(1)),
      total: Number(totalMacros.toFixed(1)),
    });
  }, [ingredients]);

  return (
    <main className="h-full mx-auto flex flex-col md:flex-row px-6 md:px-16 gap-8 py-5 bg-bg-semi-white">
      <form
        action={() => {
          handleSubmit();
        }}
        style={{ flex: 2 }}
        className="flex flex-col gap-y-6 justify-between"
      >
        <h1 className="text-[28px] text-text-3 tracking-tight font-bold">
          Crear receta
        </h1>

        <input
          aria-label="Nombre de la receta"
          type="text"
          required
          placeholder="Nombre de la receta"
          onChange={(e) =>
            setRecipe((prev) => ({ ...prev, name: e.target.value }))
          }
          value={recipe.name}
          className="outline-none px-4 py-2 border border-gray-300 rounded-[4px] py-2 text-[16px] w-full text-text-5 font-bold"
        />

        {!recipe.main_image ? (
          <div
            className={`flex items-center justify-center border transition-all duration-300 min-h-[200px] border-dashed rounded-[10px] text-center bg-gray-50 ${
              isDragOver
                ? "border-bg-yellow scale-105"
                : "border-[#dbdbdb] hover:border-[#e5a657]"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const files = Array.from(e.dataTransfer.files);
              handleFiles(files, "image", "main_image");
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <FileImage size={20} className="text-text-6" />

              <div>
                <p className="text-[14px] text-text-6">
                  Arrastrar y soltar imágenes, o
                </p>
                <button
                  type="button"
                  className="text-[14px] cursor-pointer text-bg-yellow underline"
                  onClick={() => {
                    imageInputRef.current?.click();
                  }}
                >
                  seleccionar archivos
                </button>
              </div>
            </div>

            <input
              aria-label="file-input"
              ref={imageInputRef}
              type="file"
              accept="image/jpeg, image/png, image/webp, image/jpg"
              className="hidden"
              onChange={(e) => {
                handleFiles(
                  e.target.files ? Array.from(e.target.files) : [],
                  "image",
                  "main_image",
                );
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-4">
            <div className="overflow-hidden h-[200px] rounded-[10px] relative">
              <img
                className="w-full object-cover h-full relative z-10"
                alt={`Preview`}
                src={(recipe.main_image as UploadableFile)?.uri}
              />
              <button
                type="button"
                onClick={() =>
                  setRecipe((prev) => ({ ...prev, main_image: "" }))
                }
                title="Eliminar Imagen"
                className="absolute bottom-4 right-4 z-10 backdrop-blur-sm hover:scale-105 transition-all duration-200 border-2 border-bg-red p-2 rounded-[10px] cursor-pointer"
              >
                <Trash2 color="#B53325" className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* INPUTS DE INFORMACIÓN DE RECETA */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-x-6 py-1 border-y border-[#dbdbdb]">
          {recipeStats.map((stat, index) => (
            <div key={stat.id} className="flex items-center gap-x-4">
              {stat.icon}
              <span className="font-normal text-[14px] text-text-4">
                {stat.text}
              </span>
              {index !== recipeStats.length - 1 && (
                <span className="text-lg">•</span>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-5">Descripción</h2>

          <textarea
            aria-label="Descripción de la receta"
            placeholder="Escribe aquí la descripción de tu receta..."
            required
            onChange={(e) =>
              setRecipe((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            value={recipe.description}
            className="outline-none px-4 py-2 border border-gray-300 rounded-[4px] py-2 text-[16px] min-h-[100px] max-h-[500px] w-full text-text-6 placeholder:text-[16px] placeholder:text-text-6"
          />
        </div>

        {/* INGREDIENTES */}
        <section className="space-y-2">
          <h2 className="text-[20px] font-bold text-text-5">Ingredientes</h2>

          {ingredients.map((item, index) => (
            <div key={index} className="flex flex-row flex-wrap gap-x-1">
              <button
                type="button"
                onClick={() => {
                  handleModal(index, "ingredient");
                }}
                className="outline-none cursor-pointer text-[14px] flex items-center flex-1 border border-gray-300 rounded-[4px] py-1.5 px-3 text-text-6"
              >
                {capitalize(item.ingredient?.name || "Agregar ingrediente")}
              </button>

              <input
                aria-label="Cantidad del ingrediente"
                type="text"
                required
                placeholder="Cantidad"
                onChange={(e) =>
                  setIngredients((prev) =>
                    prev.map((item, idx) =>
                      idx === index
                        ? { ...item, quantity: e.target.value }
                        : item,
                    ),
                  )
                }
                value={item.quantity}
                className="outline-none text-[14px] flex items-center border border-gray-300 rounded-[4px] py-1.5 px-3 text-text-6 font-outfit-light"
              />

              <button
                type="button"
                onClick={() => {
                  handleModal(index, "unit");
                }}
                className="outline-none cursor-pointer text-[14px] border border-gray-300 rounded-[4px]  py-1.5 px-3 text-text-6 font-outfit-light"
              >
                {UnitNames[item.unit].abbreviation}
              </button>
            </div>
          ))}

          <div className="flex flex-row w-full gap-2 flex-wrap">
            {["Agregar ingrediente", "Eliminar ingrediente"].map(
              (item, idx) => {
                if (idx === 1 && ingredients.length === 1) return null;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (idx === 0) {
                        setIngredients([
                          ...ingredients,
                          {
                            ingredient: null,
                            quantity: "",
                            unit: Unit.GRAMOS,
                            notes: "",
                          },
                        ]);
                      } else {
                        setIngredients(ingredients.slice(0, -1));
                      }
                    }}
                    className="cursor-pointer flex-1 flex flex-row items-center w-full justify-center gap-x-2 py-2 rounded-[5px] justify-center border border-[#e5a657]"
                  >
                    <Plus color="#e5a657" size={20} />
                    <span className="text-[14px] text-text-3">{item}</span>
                  </button>
                );
              },
            )}
          </div>
        </section>

        {/* PASOS */}
        <section className="space-y-2">
          <h2 className="text-[20px] font-bold text-text-5">Pasos</h2>

          <StepsList steps={steps} setSteps={setSteps} />

          <div className="flex flex-row w-full gap-2 flex-wrap">
            {["Agregar nuevo paso", "Eliminar paso"].map((item, idx) => {
              if (idx === 1 && steps.length === 1) return null;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (idx === 0) {
                      setSteps([
                        ...steps,
                        {
                          id: crypto.randomUUID(),
                          step_number: steps.length + 1,
                          description: "",
                          estimated_time: null,
                        },
                      ]);
                    } else {
                      setSteps(steps.slice(0, -1));
                    }
                  }}
                  className="cursor-pointer flex-1 flex flex-row items-center w-full justify-center gap-x-2 py-2 rounded-[5px] justify-center border border-[#e5a657]"
                >
                  <Plus color="#e5a657" size={20} />
                  <span className="text-[14px] text-text-3">{item}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitDisabled || isSubmitting}
            className={`flex items-center px-4 py-1.5 font-bold rounded-full text-[16px] transition-all duration-200 ${
              isSubmitDisabled || isSubmitting
                ? "cursor-not-allowed opacity-50 bg-gray-200 text-gray-400"
                : "cursor-pointer bg-bg-semi-black text-text-1 hover:bg-[#4A4947]"
            }`}
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </form>
      <aside style={{ flex: 1 }}>
        {nutrition && nutrition.total > 0 && (
          <NutritionPie nutrition={nutrition} />
        )}
      </aside>

      {open && (
        <div style={{ zIndex: 999 }} className="fixed inset-0">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => {
              setOpen(false);
            }}
          />

          <aside
            style={{ zIndex: 1000 }}
            className="absolute right-0 top-0 h-full w-[85vw] sm:w-[400px] bg-bg-semi-white py-3 px-6 border-l border-gray-300 shadow-2xl overflow-y-auto flex flex-col gap-y-3 animate-in slide-in-from-right duration-300"
          >
            <header className="flex flex-row gap-x-4 justify-start items-center">
              <button
                type="button"
                className="cursor-pointer transition-all rounded-full p-1.5 hover:bg-gray-200 duration-200"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <X size={20} color="#2F2F2F" />
              </button>
              <h2 className="font-bold text-[18px] text-text-3">{type}</h2>
            </header>

            {sections}
          </aside>
        </div>
      )}
    </main>
  );
}
