import type { RecipeStepDTO } from "@/interface/global.dto";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type StepsPartial = { id: string } & RecipeStepDTO;

interface Props {
  item: StepsPartial;
  setSteps: Dispatch<SetStateAction<StepsPartial[]>>;
}

export function SortableStepItem({ item, setSteps }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-row w-full flex-wrap gap-2 h-full"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab hidden sm:flex active:cursor-grabbing flex text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={20} />
      </button>

      <span className="font-bold">{item.step_number}</span>

      <div className="flex flex-col flex-1 gap-y-2">
        <div className="flex flex-col w-full md:flex-row flex-wrap gap-2">
          <textarea
            aria-label="Descripción del paso"
            required
            placeholder="Descripción del paso"
            value={item.description}
            onChange={(e) => {
              setSteps((prev) =>
                prev.map((step) =>
                  step.id === item.id
                    ? { ...step, description: e.target.value }
                    : step,
                ),
              );
            }}
            className="outline-none flex flex-1 text-sm max-h-[200px] overflow-y-auto border border-gray-300 rounded-[4px] px-3 py-1.5 text-text-6"
          />

          <input
            type="number"
            className="outline-none text-sm border border-gray-300 rounded-[4px] px-3 py-1.5 text-text-6"
            placeholder="Tiempo estimado (min)"
            min={0}
            onChange={(e) => {
              const val = e.target.value;
              setSteps((prev) =>
                prev.map((step) =>
                  step.id === item.id
                    ? { ...step, estimated_time: val === "" ? null : Number(val) }
                    : step,
                ),
              );
            }}
            value={item.estimated_time ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
