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
  RecipeDTO,
  RecipeIngredientDTO,
  RecipeStepDTO,
  UploadableFile,
} from "@/interface/global.dto";
import { capitalize } from "@/utils/capitalize";
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

type RecipePartial = Omit<RecipeDTO, "ingredients" | "steps">;

type StepsPartial = { id: string } & RecipeStepDTO;

export default function CreateRecipe() {
  const { post, clearPost } = usePostCreateStore();

  const [nutrition, setNutrition] = useState<NutritionData | null>(null);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"Ingredientes" | "Unidades">("Ingredientes");

  const { data, isLoading } = useIngredients(true);

  const indexIngredient = useRef<number | null>(null);
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
      image_url: "",
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

  const [instructionFiles, setInstructionFiles] = useState<
    Record<string, File>
  >({});

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const handleSubmit = async () => {};

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

    return invalidIngredient || invalidStep;
  }, [ingredients, steps]);

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

  console.log("NUTRICION", nutrition);
  console.log("INGREDIENTES", ingredients);

  return (
    <main className="flex flex-col md:flex-row gap-6 my-5 w-[90%] mx-auto">
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
            className={`flex items-center justify-center border min-h-[200px]  border-dashed rounded-[10px] text-center bg-gray-50 ${
              isDragOver
                ? "border-[#e5a657] bg-orange-50"
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
              //handleRecipeImage(files);
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
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  //handleRecipeImage(Array.from(files));
                }
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
                className="absolute bottom-4 right-4 z-10 backdrop-blur-xs border-1 border-white p-2 rounded-[10px] cursor-pointer"
              >
                <Trash2 fill="#b53325" className="w-6 h-6 text-white" />
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
                <span className="text-[18px]">•</span>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-bold text-text-5">Descripción</h2>

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
                          image_url: "",
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
            disabled={isSubmitDisabled}
            className="flex items-center px-4 py-1.5 font-bold rounded-full text-[16px] cursor-not-allowed opacity-50 bg-gray text3"
          >
            Publicar
          </button>
        </div>
      </form>
      <aside style={{ flex: 1 }}>
        {nutrition && nutrition.total > 0 && (
          <NutritionPie nutrition={nutrition} />
        )}
      </aside>

      {open && (
        <div
          style={{ zIndex: 999 }}
          className="fixed inset-0 flex h-screen w-screen"
        >
          <div
            style={{ flex: 3 }}
            className="bg-black/40"
            onClick={() => {
              setOpen(false);
            }}
          />

          <aside
            style={{ zIndex: 1000 }}
            className="bg-bg-semi-white border-l border-gray-400 shadow-xl shadow-gray-200 overflow-y-auto p-4 flex flex-col gap-y-3"
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
