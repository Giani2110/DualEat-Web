import type { Dispatch, SetStateAction } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableStepItem } from "./SortableStepItem";
import type { RecipeStepDTO } from "@/interface/global.dto";

type StepsPartial = { id: string } & RecipeStepDTO;

interface Props {
  steps: StepsPartial[];
  setSteps: Dispatch<SetStateAction<StepsPartial[]>>;
}

export default function StepsList({ steps, setSteps }: Props) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reorderedArray = arrayMove(items, oldIndex, newIndex);

        return reorderedArray.map((step, idx) => ({
          ...step,
          step_number: idx + 1,
        }));
      });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={steps.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-y-3">
          {steps.map((item: RecipeStepDTO, index: number) => (
            <SortableStepItem key={index} item={item} setSteps={setSteps} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
