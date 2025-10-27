import { useState, useEffect, useRef } from "react";
import type { Ingredient, UnitOfMeasure } from "@interface/global";
import { getAllIngredients, getAllUnits } from "@services/recipes.api";

import { capitalize } from "@utils/capitalize";

import { Trash2, GripVertical, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Tipo para un ingrediente en el formulario
interface FormIngredient {
  id: string;
  ingredientId: string;
  quantity: string;
  unitId: string;
  notes?: string;
  name: string;
}

// Componente sortable individual
const SortableIngredient = ({
  formIngredient,
  units,
  ingredients,
  updateIngredient,
  removeIngredient,
  canRemove,
}: {
  formIngredient: FormIngredient;
  units: UnitOfMeasure[];
  ingredients: Ingredient[];
  updateIngredient: (
    id: string,
    field: Partial<FormIngredient>,
  ) => void;
  removeIngredient: (id: string) => void;
  canRemove: boolean;
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
    []
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: formIngredient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Filtrar ingredientes basado en el input
  useEffect(() => {
    const removeAccents = (str: string) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    if (formIngredient.name && formIngredient.name.length > 0) {
      const search = removeAccents(formIngredient.name).toLowerCase();

      const filtered = ingredients.filter((ingredient) =>
        removeAccents(ingredient.name.toLowerCase()).includes(search)
      );

      setFilteredIngredients(filtered);
    } else {
      setFilteredIngredients([]);
    }
  }, [formIngredient.name, ingredients]);

  // Cerrar sugerencias cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateIngredient(formIngredient.id, { name: value });
    setShowSuggestions(value.length > 0);
  };

  const handleInputFocus = () => {
    if (formIngredient.name.length > 0) {
      setShowSuggestions(true);
    }
  };

  const selectIngredient = (ingredient: Ingredient) => {
  updateIngredient(formIngredient.id, {
    name: ingredient.name,
    ingredientId: String(ingredient.id),
  });
  setShowSuggestions(false);
  inputRef.current?.blur();
};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col items-center gap-3 w-full ${
        isDragging ? "z-10" : ""
      }`}
    >
      <div className="flex items-center gap-2 w-full">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 flex-shrink-0"
        >
          <GripVertical size={16} strokeWidth={1.5} />
        </div>

        {/* Input de cantidad + Select de unidad */}
        <div className="border border-[#dbdbdb] rounded-[5px] flex flex-shrink-0">
          <input
            placeholder="4"
            className="text5 text-[13px] outline-none ps-2 w-16 sm:w-20 md:w-24 py-2"
            type="text"
            value={formIngredient.quantity}
            onChange={(e) =>
              updateIngredient(formIngredient.id, { quantity: e.target.value })
            }
            required
          />
          <select
            title="Unidad"
            className="outline-none text5 text-[13px] border-s-1 border-[#dbdbdb] bg-[#fcfcfc] rounded-tr-[5px] rounded-br-[5px] py-2 pe-1 cursor-pointer w-16 sm:w-20 md:w-24"
            value={formIngredient.unitId}
            onChange={(e) =>
              updateIngredient(formIngredient.id, { unitId: e.target.value })
            }
          >
            <option value="" disabled>
              Seleccionar unidad
            </option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        {/* Input para el nombre del ingrediente con autocompletado */}
        <div className="flex-1 min-w-0 relative">
          <input
            ref={inputRef}
            placeholder="Nombre del ingrediente"
            className="w-full text5 text-[13px] outline-none px-2 py-2 border border-[#dbdbdb] rounded-[5px]"
            type="text"
            value={formIngredient.name}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            required
          />

          {/* Dropdown de sugerencias */}
          {showSuggestions && filteredIngredients.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 bg-white border border-[#dbdbdb] rounded-[5px] shadow-lg max-h-48 overflow-y-auto z-50 mt-1"
            >
              {filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-[13px] text5 border-b border-gray-100 last:border-b-0"
                  onClick={() => selectIngredient(ingredient)}
                >
                  {capitalize(ingredient.name)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón para eliminar */}
        {canRemove && (
          <button
            type="button"
            onClick={() => removeIngredient(formIngredient.id)}
            className="text-gray-600 hover:text-red-700 cursor-pointer px-2 py-1 rounded transition-colors flex-shrink-0"
            title="Eliminar ingrediente"
          >
            <Trash2 strokeWidth={1.5} size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0 w-full">
        <input
          ref={inputRef}
          placeholder="Notas (opcional) - Ej: picado, orgánico, marca, etc."
          className="w-full text5 text-[13px] outline-none px-2 py-2 border border-[#dbdbdb] rounded-[5px]"
          type="text"
          value={formIngredient.notes || ""}
          onChange={(e) =>
            updateIngredient(formIngredient.id, { notes: e.target.value })
          }
        />
      </div>
    </div>
  );
};

interface IngredientsCardProps {
  formIngredients: FormIngredient[];
  setFormIngredients: React.Dispatch<React.SetStateAction<FormIngredient[]>>;
}

const IngredientsCard: React.FC<IngredientsCardProps> = ({
  formIngredients,
  setFormIngredients,
}) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchIngredients = async () => {
    const ingredients = await getAllIngredients();
    if (ingredients && ingredients.success) {
      setIngredients(ingredients.data as Ingredient[]);
    }
  };

  const fetchUnits = async () => {
    const units = await getAllUnits();
    if (units && units.success) {
      setUnits(units.data as UnitOfMeasure[]);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchUnits();
  }, []);

  const addIngredient = () => {
    setFormIngredients([
      ...formIngredients,
      {
        id: crypto.randomUUID(),
        ingredientId: "",
        quantity: "",
        unitId: "",
        name: "",
        notes: "",
      },
    ]);
  };

  const removeIngredient = (id: string) => {
    if (formIngredients.length > 1) {
      setFormIngredients(formIngredients.filter((ing) => ing.id !== id));
    }
  };

  const updateIngredient = (
  id: string,
  fields: Partial<FormIngredient>
) => {
  setFormIngredients(
    formIngredients.map((ing) =>
      ing.id === id ? { ...ing, ...fields } : ing
    )
  );
};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = formIngredients.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = formIngredients.findIndex(
        (item) => item.id === over?.id
      );
      setFormIngredients(arrayMove(formIngredients, oldIndex, newIndex));
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-[16px] Dosis-Bold tracking-tight">Ingredientes</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={formIngredients}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 mt-3">
            {formIngredients.map((formIngredient) => (
              <SortableIngredient
                key={formIngredient.id}
                formIngredient={formIngredient}
                units={units}
                ingredients={ingredients}
                updateIngredient={updateIngredient}
                removeIngredient={removeIngredient}
                canRemove={formIngredients.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addIngredient}
        className="mt-5 text-[15px] items-center flex gap-2 justify-center w-full cursor-pointer text-yellow hover:text-blue-800 border border-[#dbdbdb] hover:border-[#e5a657] rounded-[5px] px-3 py-2 transition-colors"
      >
        <Plus size={18} /> Agregar ingrediente
      </button>
    </div>
  );
};

export default IngredientsCard;
