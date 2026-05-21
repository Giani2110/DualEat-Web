import { useState, useEffect, useRef } from "react";

import { useAuth } from "@hooks/useAuth";
import { getUserCommunities } from "@services/community.api";
import {
  Trash2,
  FileImage,
  ChevronsUpDown,
} from "lucide-react";
import IngredientsCard from "@/components/private/users/post/IngredientsCard";
import InstructionCard from "@/components/private/users/post/InstructionsCard";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import { createPost } from "@services/post.api";

import toast from "react-hot-toast";

import type {
  CreatePostDTO,
  CreateRecipeDTO,
  UploadableFile,
} from "@interface/global.dto";
import type { Community } from "@interface/global";

import "@assets/scss/private/users/users.scss";
import { CustomToolbar } from "@/components/shared/EditorToolbar";

type UserCommunityEntry = {
  community: Community;
  is_moderator: boolean;
  joined_at: string;
};

interface FormInstruction {
  id: string;
  step_number: number;
  description: string;
  image_url?: string;
  estimated_time?: number;
}

interface FormIngredient {
  id: string;
  ingredientId: string;
  quantity: string;
  unitId: string;
  notes?: string;
  name: string; // nombre del ingrediente para mostrar en el input
}

const UPost = () => {
  // ===========================================
  // HOOKS & AUTH
  // ===========================================
  const { user } = useAuth();

  const fileInputRef = useRef<any>(null);

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [images, setImages] = useState<UploadableFile[]>([]);
  const [video, setVideo] = useState<UploadableFile | null>(null);

  const [community, setCommunity] = useState<Community | null>(null);

  const [withRecipe, setWithRecipe] = useState(false);

  const [step, setStep] = useState<"1" | "2">("1");

  // ===========================================
  // ESTADOS DE COMUNIDADES
  // ===========================================
  const [joinedCommunities, setJoinedCommunities] = useState<
    UserCommunityEntry[]
  >([]);

  // ===========================================
  // ESTADOS DE RECETA
  // ===========================================
  const [instructions, setInstructions] = useState<FormInstruction[]>([
    {
      id: crypto.randomUUID(),
      step_number: 1,
      description: "",
      image_url: "",
      estimated_time: 0,
    },
  ]);

  const [formIngredients, setFormIngredients] = useState<FormIngredient[]>([
    {
      id: crypto.randomUUID(),
      ingredientId: "",
      quantity: "",
      unitId: "",
      notes: "",
      name: "",
    },
  ]);

  const [instructionFiles, setInstructionFiles] = useState<
    Record<string, File>
  >({});

  const [recipeName, setRecipeName] = useState<string>("");
  const [recipeDescription, setRecipeDescription] = useState<string>("");
  const [recipeImage, setRecipeImage] = useState<File[]>([]);

  const [recipeImagePreviews, setRecipeImagePreviews] = useState<string[]>([]);

  // ===========================================
  // ESTADOS DE ARCHIVOS MULTIMEDIA
  // ===========================================
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ===========================================
  // VALORES CALCULADOS
  // ===========================================
  const totalEstimatedTime = instructions.reduce(
    (acc, curr) => acc + (curr.estimated_time || 0),
    0,
  );

  const handleRecipeImage = (files: File[]) => {
    const validFiles = files.filter((file) =>
      ["image/"].some((type) => file.type.startsWith(type)),
    );

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setRecipeImage(validFiles);
    setRecipeImagePreviews(newPreviews);

    console.log("Archivos seleccionados:", validFiles);
  };

  const removeFile = (index: number) => {
    // Liberar la URL del objeto para evitar memory leaks
    URL.revokeObjectURL(filePreviews[index]);

    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));

    // Ajustar el índice actual si es necesario
    if (index === currentImageIndex && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (index < currentImageIndex) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // ===========================================
  // MANEJO DEL FORMULARIO
  // ===========================================
  const handlePost = () => {
    if (!community) {
      toast.error("Debes seleccionar una comunidad");
      return;
    }

    if (withRecipe && title && content && community) {
      setStep("2");
    }
  };

  const handleSubmit = async () => {
    if (!community) {
      toast.error("Debes seleccionar una comunidad");
      return;
    }

    try {
      if (recipe) {
        // VALIDACIÓN DE RECETA
        if (!recipeName.trim())
          throw new Error("El nombre de la receta es obligatorio");
        if (!recipeDescription.trim())
          throw new Error("La descripción de la receta es obligatoria");
        if (recipeImage.length === 0)
          throw new Error("Debes subir al menos una imagen de la receta");
        if (
          instructions.length === 0 ||
          instructions.some((i) => !i.description.trim())
        )
          throw new Error("Cada paso debe tener una descripción");
        if (
          formIngredients.length === 0 ||
          formIngredients.some((i) => !i.name.trim())
        )
          throw new Error("Debes agregar al menos un ingrediente con nombre");

        // Crear payloads
        const postPayload: CreatePostDTO = {
          title,
          content,
          image_urls: uploadedFiles,
          type: "recipe",
          community_id: community.id,
        };

        const recipePayload: CreateRecipeDTO = {
          name: recipeName,
          description: recipeDescription,
          main_image: recipeImage[0],
          total_time: totalEstimatedTime,

          ingredients: formIngredients.map((i) => ({
            ingredient_id: i.ingredientId,
            quantity: i.quantity,
            unit_of_measure_id: i.unitId,
            notes: i.notes,
          })),

          steps: instructions.map((i) => ({
            step_number: String(i.step_number),
            description: i.description,
            image_url: instructionFiles[i.id] || null,
            estimated_time: String(i.estimated_time),
          })),
        };

        await createPost(postPayload, recipePayload);
      } else {
        // VALIDACIÓN DE POST NORMAL
        if (!title.trim()) throw new Error("El título es obligatorio");
        if (!content.trim())
          throw new Error("El contenido o una imagen es obligatorio");

        const postPayload: CreatePostDTO = {
          title,
          content,
          image_urls: uploadedFiles,
          type: "post",
          community_id: community.id,
        };

        await createPost(postPayload);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Error creando el post");
      }
    }
  };

  const customCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Dosis:wght@400;500;600;700&display=swap');

  .ProseMirror p {
    font-family: 'Dosis', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 16px;
    color: #2F2F2F;
    line-height: 1.5;
    margin-top: 0;
  }

  .ProseMirror p.is-empty:first-child::before {
    content: attr(data-placeholder);
    color: #707070; 
    font-size: 16px;
    font-family: 'Dosis', sans-serif;
    pointer-events: none;
    height: 0;
    float: left;
  }

  .ProseMirror a {
    color: #3578e4; 
    text-decoration: underline;
  }

  .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .ProseMirror li {
    margin-bottom: 0.25rem;
  }

  .ProseMirror h1 {
    font-size: 1.25em;
    font-weight: 700;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-family: 'Dosis', sans-serif;
  }

  .ProseMirror strong {
    font-weight: 700;
  }

  .ProseMirror s {
    text-decoration: line-through;
  }
  `;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({
        placeholder: "Empieza a escribir...",
      }),
    ],

    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose focus:outline-none p-4 text-[var(--text-5)] text-[16px]",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const style = document.createElement("style");
      style.textContent = customCSS;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [editor]);

  console.log("Contenido del editor:", editor?.getHTML());

  // Fetch comunidades del usuario
  useEffect(() => {
    const fetchCommunities = async () => {
      if (!user) return;
      const communities = await getUserCommunities();

      if (communities && communities.success) {
        setJoinedCommunities(communities.data as UserCommunityEntry[]);
        console.log("Joined communssssities:", communities.data);
      }
    };
    fetchCommunities();
  }, [user]);

  console.log("Images: ", images);
  console.log("Video: ", video);

  // ===========================================
  // RENDER
  // ===========================================
  return (
    <section className="flex gap-[50px] mt-8 w-[80%] mx-auto">
      {/* ===========================================
            PASO 1 - CONTENIDO IZQUIERDO
            =========================================== */}
      {step === "1" && (
        <div className="w-full">
          <h1 className="text-[28px] text3 tracking-tight Dosis-Bold mb-4">
            Crear post
          </h1>

          {/* SELECTOR DE COMUNIDADES */}
          <button
            type="button"
            className="flex items-center gap-x-2.5 bgsemi-white border border-[#e5a657] px-4 py-2 rounded-full cursor-pointer w-fit"
          >
            <img
              src={
                (community && community.image_url) ||
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
              }
              alt=""
              className="w-5 h-5 rounded-full"
            />
            <span className="text-[14px] text4 tracking-tight">
              {(community && community.name) || "Seleccionar comunidad"}
            </span>

            <ChevronsUpDown size={16} className="text-[#333333]" />
          </button>

          {/* FORMULARIO PRINCIPAL */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (withRecipe) {
                handlePost();
              } else {
                handleSubmit();
              }
            }}
            className="flex flex-col gap-y-6"
          >
            <div className="relative mt-8">
              <input
                type="text"
                placeholder="Título"
                className="peer w-full border text-[14px] text5 px-4 pb-2 pt-6 rounded-[20px] border-[#707070] placeholder-transparent focus:outline-none focus:border-[#e5a657] focus:border-2"
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                required
              />
              <label
                htmlFor="title"
                className={`absolute left-4 text4 tracking-wide cursor-text transition-all duration-300 ${
                  title
                    ? "top-2 text-[14px] peer-focus:top-2 peer-focus:text-[12px]"
                    : "top-4 text-[16px] peer-focus:top-2 peer-focus:text-[12px]"
                }`}
              >
                Título
                <span className="text-red">*</span>
              </label>
            </div>

            {/* PREVIEW DE IMÁGENES CON SLIDER */}
            

            {/* INPUT CONTENIDO */}
            <div className="border border-[#707070] rounded-[20px] overflow-hidden flex flex-col resize-y min-h-[100px] max-h-[250px]">
              <CustomToolbar
                editor={editor}
                images={images}
                video={video}
                setImages={setImages}
                setVideo={setVideo}
              />

              <div className="flex-grow overflow-y-auto">
                <EditorContent
                  editor={editor}
                  className="cursor-text h-full outline-none text-[16px]"
                  onClick={() => editor?.commands.focus()}
                />
              </div>

              <input type="file" ref={fileInputRef} className="hidden" />
            </div>

            {/* BOTÓN DE PUBLICACIÓN */}
            <div className="flex justify-end">
              <button
                type="submit"
                className={`flex items-center px-4 py-1.5 Dosis-Bold rounded-full text-[16px] ${
                  !content || !title
                    ? "cursor-not-allowed opacity-50 bg-gray text3"
                    : "pointer-events-auto cursor-pointer opacity-100 bg-yellow hover:bg-[#05357e] text1"
                }`}
              >
                {withRecipe ? "Siguiente" : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===========================================
            PASO 2 - CONTENIDO DERECHO 
            =========================================== */}
      {step === "2" && (
        <form
          action={() => {
            handleSubmit();
          }}
          className="w-[95%] flex-wrap justify-between gap-6 flex p-6"
        >
          {/* INFORMACIÓN GENERAL DE LA RECETA */}
          <div className="flex-[1] lg:flex-[0.5] h-fit">
            <h1 className="text5 text-[18px] Dosis-Bold mb-3 tracking-tight">
              Información general de la receta
            </h1>
            <div className="flex flex-col bg-white h-full rounded-[20px] px-6 py-8 gap-8">
              {/* SUBIDA DE IMAGEN DE RECETA */}
              {recipeImagePreviews.length === 0 ? (
                <div className="relative">
                  <div
                    className={`border-2 border-dashed rounded-[20px] p-12 text-center bg-gray-50/50 ${
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
                      handleRecipeImage(files);
                    }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <FileImage size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[14px] text-gray-600 font-medium">
                          Arrastrar y soltar imágenes, o
                        </p>
                        <button
                          type="button"
                          className="text-[14px] cursor-pointer text-[#e5a657] hover:text-[#d4941f] font-medium underline mt-1"
                          onClick={() => {
                            const input =
                              document.getElementById("file-input-recipe");
                            if (input) input.click();
                          }}
                        >
                          seleccionar archivos
                        </button>
                      </div>
                    </div>

                    <input
                      aria-label="file-input"
                      id="file-input-recipe"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          handleRecipeImage(Array.from(files));
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <div className="overflow-hidden h-[200px] rounded-[10px] relative">
                    <img
                      className="w-full object-cover h-full relative z-10"
                      alt={`Preview ${currentImageIndex}`}
                      src={recipeImagePreviews[0]}
                    />
                    <button
                      type="button"
                      onClick={() => setRecipeImagePreviews([])}
                      title="Eliminar Imagen"
                      className="absolute bottom-4 right-4 z-10 backdrop-blur-xs border-1 border-white p-2 rounded-[10px] cursor-pointer"
                    >
                      <Trash2 fill="#b53325" className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* INPUTS DE INFORMACIÓN DE RECETA */}
              <div className="space-y-2">
                <p className="text-[16px] text5 tracking-[-0.4px] Dosis-Bold">
                  Nombre de la receta
                </p>
                <input
                  aria-label="Nombre de la receta"
                  type="text"
                  required
                  placeholder="Ej.: Pollo al Curry Cremoso con Coco"
                  onChange={(e) => setRecipeName(e.target.value)}
                  value={recipeName}
                  className="outline-none p-[10px] border border-gray-300 rounded-[5px] text-[14px] placeholder:text-[13px] w-full"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[16px] text5 tracking-[-0.4px] Dosis-Bold">
                  Descripción de la receta
                </p>
                <textarea
                  aria-label="Descripción de la receta"
                  placeholder="Ej.: Este plato combina la suavidad y el sabor intenso"
                  required
                  onChange={(e) => setRecipeDescription(e.target.value)}
                  value={recipeDescription}
                  className="outline-none p-[10px] border border-gray-300 rounded-[5px] text-[14px] placeholder:text-[13px] min-h-[150px] w-full"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[16px] text4 tracking-[-0.4px] Dosis-Bold">
                  Tiempo de preparación
                </p>
                <div className="flex justify-between gap-4">
                  <input
                    aria-label="Tiempo de preparación"
                    disabled
                    placeholder="Ej.: 45 minutos"
                    value={
                      totalEstimatedTime +
                      " minutos" +
                      (totalEstimatedTime >= 60
                        ? " / " +
                          (totalEstimatedTime / 60).toFixed(1) +
                          " horas"
                        : "")
                    }
                    className="outline-none cursor-not-allowed opacity-50 p-[10px] border border-gray-300 rounded-[5px] text-[14px] placeholder:text-[13px] w-full"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setStep("1")}
                  className="rounded-[10px] cursor-pointer Dosis-Bold px-4 py-2 text-[15px] text1 tracking-tight bg-red"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="rounded-[10px] Dosis-Bold cursor-pointer text-[15px] text1 tracking-tight px-4 bg-blue"
                >
                  Publicar Post + Receta
                </button>
              </div>
            </div>
          </div>

          {/* DETALLES DE LA RECETA */}
          <div className="flex-[1] h-fit">
            <h1 className="text5 text-[18px] Dosis-Bold mb-3 tracking-tight">
              Detalles de la receta
            </h1>
            <div className="flex flex-col h-full rounded-[20px] gap-8">
              {/* INGREDIENTES */}
              <div className="space-y-2 bg-white px-6 py-4 rounded-[10px]">
                <IngredientsCard
                  formIngredients={formIngredients}
                  setFormIngredients={setFormIngredients}
                />
              </div>

              {/* INSTRUCCIONES */}
              <div className="space-y-2 bg-white px-6 py-4 rounded-[10px]">
                <InstructionCard
                  instructions={instructions}
                  setInstructions={setInstructions}
                  setInstructionFiles={setInstructionFiles}
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

export default UPost;

/** (value === "Image" && uploadedFiles.length === 0)
                    ? "cursor-not-allowed opacity-50 bg-black/70"
                    : "pointer-events-auto cursor-pointer opacity-100 bg-[#0A449B] hover:bg-[#05357e]" */
