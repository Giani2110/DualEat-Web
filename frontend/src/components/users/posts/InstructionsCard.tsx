import { useState, useRef } from "react";

import { Trash2, GripVertical, Plus, Camera } from "lucide-react";
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

interface FormInstruction {
  id: string;
  step_number: number;
  description: string;
  image_url?: string;
  estimated_time?: number;
}

const SortableInstruction = ({
  formInstruction,
  updateInstruction,
  removeInstruction,
  isDragOver,
  setIsDragOver,
  handleFiles,
  canRemove,
}: {
  formInstruction: FormInstruction;
  updateInstruction: (
    id: string,
    field: keyof FormInstruction,
    value: string | number | undefined
  ) => void;
  removeInstruction: (id: string) => void;
  isDragOver: boolean;
  setIsDragOver: React.Dispatch<React.SetStateAction<boolean>>;
  handleFiles: (files: File[], instructionId: string) => void;
  canRemove: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: formInstruction.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch flex-wrap gap-2 mb-3 w-full h-full ${
        isDragging ? "z-10" : ""
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 flex-shrink-0"
      >
        <GripVertical size={18} strokeWidth={1.5} />
      </div>

      <h1 className="text-[13px] text4 font-semibold">
        {formInstruction.step_number}
      </h1>

      {/* Imagen */}
      {formInstruction.image_url === "" ? (
        <div className="relative ms-2 flex-[0.5]">
          <div
            className={`border rounded-[10px] h-full cursor-pointer group text-center bg-gray-50/50 ${
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
              handleFiles(files, formInstruction.id);
            }}
            onClick={() => {
              const input = document.getElementById("file-input-step");
              if (input) input.click();
            }}
          >
            <div className="flex flex-col h-full justify-center items-center">
              <Camera
                strokeWidth={1.5}
                size={20}
                className="text-gray-500 group-hover:text-[#e5a657] transition-colors"
              />
            </div>
            <input
              aria-label="file-input"
              id="file-input-step"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  handleFiles(Array.from(files), formInstruction.id);
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div className="relative group ms-2 flex-[0.5]">
          <img
            src={formInstruction.image_url}
            alt="Imagen de la receta"
            className="object-contain w-full rounded-[5px]"
          />
          <button
            type="button"
            onClick={() =>
              updateInstruction(formInstruction.id, "image_url", "")
            }
            className="absolute top-2 right-1 p-1 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-600 hover:text-red-700 cursor-pointer rounded transition-all opacity-0 group-hover:opacity-100"
            title="Eliminar foto"
          >
            <Trash2 strokeWidth={1.5} size={18} />
          </button>
        </div>
      )}

      {/* Descripción */}
      <div
        onClick={focusInput}
        className="flex-[3] min-w-[200px] border border-[#dbdbdb] rounded-[10px]"
      >
        <textarea
          ref={inputRef}
          placeholder="Descripción de la receta"
          value={formInstruction.description}
          className="w-full h-full py-[14px] text5 text-[13px] outline-none no-scrollbar px-2"
          onChange={(e) =>
            updateInstruction(formInstruction.id, "description", e.target.value)
          }
        />
      </div>

      {/* Tiempo estimado */}
      <div className="flex-[0.3] min-w-[120px]  border border-[#dbdbdb] rounded-[10px]">
        <input
          type="number"
          step={5}
          min={0}
          placeholder="Estimado (min)"
          className="w-full h-full text5 text-[13px] outline-none px-2"
          value={formInstruction.estimated_time || ""}
          onChange={(e) =>
            updateInstruction(
              formInstruction.id,
              "estimated_time",
              e.target.value === "" ? 0 : parseInt(e.target.value)
            )
          }
        />
      </div>

      {/* Botón eliminar */}
      {canRemove && (
        <button
          type="button"
          onClick={() => removeInstruction(formInstruction.id)}
          className="flex-[0] text-gray-600 hover:text-red-700 cursor-pointer px-2 py-1 rounded transition-colors flex-shrink-0"
          title="Eliminar ingrediente"
        >
          <Trash2 strokeWidth={1.5} size={18} />
        </button>
      )}
    </div>
  );
};

const InstructionCard = () => {
  const [formInstructions, setFormInstructions] = useState<FormInstruction[]>([
    {
      id: crypto.randomUUID(),
      step_number: 1,
      description: "",
      image_url: "",
      estimated_time: 0,
    },
  ]);

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFiles = (files: File[], instructionId: string) => {
    const validFiles = files.filter((file) =>
      ["image/", "video/mp4"].some((type) => file.type.startsWith(type))
    );

    if (validFiles.length > 0) {
      const file = validFiles[0];

      const previewUrl = URL.createObjectURL(file);

      updateInstruction(instructionId, "image_url", previewUrl);
      console.log(instructionId, previewUrl);

      // (opcional) guardar el file si después lo vas a subir
      setUploadedFiles((prev) => [...prev, file]);
    }
  };
  const sensors = useSensors(useSensor(PointerSensor));

  const renumberSteps = (instructions: FormInstruction[]) => {
    return instructions.map((instruction, index) => ({
      ...instruction,
      step_number: index + 1,
    }));
  };

  const addInstruction = () => {
    setFormInstructions((prev) =>
      renumberSteps([
        ...prev,
        {
          id: crypto.randomUUID(),
          step_number: prev.length + 1,
          description: "",
          image_url: "",
          estimated_time: 0,
        },
      ])
    );
  };

  const removeInstruction = (id: string) => {
    if (formInstructions.length > 1) {
      setFormInstructions((prev) =>
        renumberSteps(prev.filter((instruction) => instruction.id !== id))
      );
    }
  };

  const updateInstruction = (
    id: string,
    field: keyof FormInstruction,
    value: string | number | undefined
  ) => {
    setFormInstructions((prev) =>
      prev.map((instruction) =>
        instruction.id === id ? { ...instruction, [field]: value } : instruction
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = formInstructions.findIndex(
        (instruction) => instruction.id === active.id
      );
      const newIndex = formInstructions.findIndex(
        (instruction) => instruction.id === over?.id
      );

      setFormInstructions((prev) =>
        renumberSteps(arrayMove(prev, oldIndex, newIndex))
      );
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-[14px] Arvo-Bold tracking-tight mb-4">
        Instrucciones
      </h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={formInstructions}
          strategy={verticalListSortingStrategy}
        >
          {formInstructions.map((formInstruction) => (
            <SortableInstruction
              key={formInstruction.id}
              formInstruction={formInstruction}
              updateInstruction={updateInstruction}
              removeInstruction={removeInstruction}
              handleFiles={handleFiles}
              isDragOver={isDragOver}
              setIsDragOver={setIsDragOver}
              canRemove={formInstructions.length > 1}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addInstruction}
        className="mt-5 text-[13px] items-center flex gap-2 justify-center w-full cursor-pointer text-yellow hover:text-blue-800 border border-[#dbdbdb] hover:border-[#e5a657] rounded-[5px] px-3 py-2 transition-colors"
      >
        <Plus size={18} /> Agregar instrucción
      </button>
    </div>
  );
};

export default InstructionCard;
