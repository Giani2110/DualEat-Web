import  { useState, useEffect, useRef } from "react";

import { useAuth } from "../../hooks/useAuth";
import { getUserCommunities } from "../../services/community.api";
import { getAllIngredients } from "../../services/recipes.api";
import { Search, ChevronDown, Images, Trash2, CircleAlert } from "lucide-react";
import UIDashboard from "../../components/users/UIDashboard";
import IngredientsCard from "../../components/users/posts/IngredientsCard";
import InstructionCard from "../../components/users/posts/InstructionsCard";

import type { Community, Ingredient } from "../../interface/global";

import "../../assets/scss/users/users.scss";

type UserCommunityEntry = {
  community: Community;
  is_moderator: boolean;
  joined_at: string;
};

const UPost = () => {
  const { user } = useAuth();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [value, setValue] = useState<"Text" | "Image">("Text");
  const [recipe, setRecipe] = useState<boolean>(false);

  const [step, setStep] = useState<"1" | "2">("2");

  const [joinedCommunities, setJoinedCommunities] = useState<
    UserCommunityEntry[]
  >([]);

  // Recipe
  const [recipeName, setRecipeName] = useState<string>("");
  const [recipeDescription, setRecipeDescription] = useState<string>("");
  const [recipeImage, setRecipeImage] = useState<File[]>([]);
  const [recipeImagePreviews, setRecipeImagePreviews] = useState<string[]>([]);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [selected, setSelected] = useState<Community | null>(null);

  const [button, setButton] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null); // Referencia para el input adicional

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Función para abrir el selector de archivos adicionales
  const handleAddMoreImages = () => {
    additionalInputRef.current?.click();
  };

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) =>
      ["image/", "video/mp4"].some((type) => file.type.startsWith(type))
    );

    // Crear URLs de preview para las imágenes
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setUploadedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);

    console.log("Archivos seleccionados:", validFiles);
  };

  const handleRecipeImage = (files: File[]) => {
    const validFiles = files.filter((file) =>
      ["image/"].some((type) => file.type.startsWith(type))
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

  // Funciones para navegar en el slider
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === filePreviews.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? filePreviews.length - 1 : prev - 1
    );
  };

  const handlePost = () => {
    if (recipe && title && content && selected) {
      setStep("2");
    }
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      if (!user) return;
      const communities = await getUserCommunities(user.id);

      if (communities && communities.success) {
        setJoinedCommunities(communities.data as UserCommunityEntry[]);
        console.log("Joined communssssities:", communities.data);
      }
    };
    fetchCommunities();
  }, [user]);

  useEffect(() => {
   if (step === "2") {
    const fetchIngredients = async () => {
      if (!user) return;
      const ingredients = await getAllIngredients();

      if (ingredients && ingredients.success) {
        setIngredients(ingredients.data as Ingredient[]);
        console.log("Ingredients:", ingredients.data);  
      }
    }
     fetchIngredients();
   }
  }, [step, user]);

  {
    /** Cerrar el dropdown */
  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setButton(false);
      }
    };

    if (button) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [button]);

  return (
    <UIDashboard>
      <section className="flex w-full gap-[50px] mt-8">
        {/** Contenido Izquierdo */}
        {step === "1" && (
          <div className="w-[50%]">
            <h2 className="text-[24px] text5 tracking-tight Arvo-Bold mb-4">
              Crear post
            </h2>

            <div ref={dropdownRef} className="relative inline-block">
              {/** Seleccionar comunidad  (switch & input)*/}
              {button ? (
                <div
                  onClick={focusInput}
                  className="flex items-center gap-3 bg-[#f3f3f3] border-2 border-[#0078D7] focus:outline-none px-5 py-2 rounded-[40px] cursor-text w-[300px]"
                >
                  <Search size={20} className="  text-[#0078D7]" />
                  <input
                    ref={inputRef}
                    className="tracking-tight placeholder:text-[14px] placeholder:text4 outline-none"
                    type="search"
                    placeholder="Seleccionar comunidad"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setButton(true)}
                  className="bg-[#f3f3f3] border-2 border-[#e5a657] px-5 py-2 rounded-[40px] cursor-pointer w-fit"
                >
                  {selected ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={selected.image_url || ""}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-[14px] text5 tracking-tight">
                        {selected.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img
                        src="https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                        alt="Imagen de la comunidad default"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-[14px] text4 tracking-tight">
                        Seleccionar comunidad
                      </span>
                      <ChevronDown size={20} className="text-[#333333]" />
                    </div>
                  )}
                </button>
              )}

              {/** Listado de comunidades */}
              {button && (
                <div className="absolute bg-white shadow-xl/20 rounded-[10px] top-full mt-3 ms-8 w-[300px] z-10">
                  {joinedCommunities.map((entry) => (
                    <button
                      type="button"
                      onClick={() => {
                        setButton(!button);
                        setSelected(entry.community);
                      }}
                      key={entry.community.id}
                      className="px-4 py-2 text-[13px] text5 tracking-tight cursor-pointer text-left w-full hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-5">
                        <img
                          src={entry.community.image_url || ""}
                          alt="Imagen de la comunidad"
                          className="w-8 h-8 rounded-full"
                        />

                        <div>
                          {entry.community.name}
                          <p className="text-[11px] text4">
                            {entry.community.total_members} miembros
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/** Seleccionar tipo de post */}
            <div className="mt-10 flex items-start gap-5 text-[14px] Arvo-Bold text5 tracking-tight">
              <button
                onClick={() => setValue("Text")}
                className="flex flex-col hover:bg-[#dbdbdb] cursor-pointer px-4 pt-2 rounded-[5px] items-center gap-2"
                type="button"
              >
                <span>Texto</span>
                <span
                  className={`h-[4px] ${
                    value === "Text" && "rounded-full w-[90%] bg-[#e5a657]"
                  }`}
                />
              </button>
              <button
                onClick={() => setValue("Image")}
                className="flex hover:bg-[#dbdbdb] cursor-pointer px-4 pt-2 flex-col rounded-[5px] items-center gap-2"
                type="button"
              >
                <span>Imágenes y video</span>
                <span
                  className={`h-[4px] ${
                    value === "Image" && "rounded-full w-[90%]  bg-[#e5a657]"
                  }`}
                />
              </button>
              <button
                onClick={() => setRecipe(!recipe)}
                className={`flex hover:bg-[#dbdbdb] cursor-pointer px-3 py-2 pb-3 flex-col rounded-[5px] items-center gap-2 ${
                  recipe &&
                  "rounded-[5px] border-[#e5a657] border-dashed border-2"
                }`}
                type="button"
              >
                <span>¿Receta?</span>
              </button>
            </div>

            {/** Formulario */}
            <form className="flex flex-col">
              {/** Título */}
              <div className="relative mt-8">
                <input
                  type="text"
                  id="title"
                  placeholder="Correo electrónico"
                  className="peer w-full border text-[14px] text5 px-4 pb-3 pt-7 rounded-[20px] border-[#dbdbdb] placeholder-transparent focus:outline-none focus:border-[#e5a657] focus:border-2"
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={300}
                  required
                />
                <label
                  htmlFor="title"
                  className={`absolute left-4 text-[#707070] cursor-text transition-all duration-300 ${
                    title
                      ? "top-2 text-[12px] peer-focus:top-2 peer-focus:text-[12px]"
                      : "top-5 text-[14px] peer-focus:top-2 peer-focus:text-[12px]"
                  }`}
                >
                  Título
                  <span className="text-red">*</span>
                </label>
              </div>

              <div className="flex justify-end text4 text-[12px] tracking-tight me-4 mt-2">
                {title.length}/300
              </div>

              {/** Div de subida de imágenes */}
              {value === "Image" && filePreviews.length === 0 && (
                <>
                  <div className="relative mt-8">
                    <div
                      className={`border-2 border-dashed rounded-[20px] p-12 text-center transition-all duration-300 bg-gray-50/50 ${
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
                        handleFiles(files);
                      }}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                            />
                          </svg>
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
                                document.getElementById("file-input");
                              if (input) input.click();
                            }}
                          >
                            seleccionar archivos
                          </button>
                        </div>
                      </div>

                      <input
                        aria-label="file-input"
                        id="file-input"
                        type="file"
                        accept="image/*,video/mp4"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            handleFiles(Array.from(files));
                          }
                        }}
                      />
                    </div>
                  </div>
                  {uploadedFiles.length === 0 && (
                    <div className="flex gap-2 items-center mt-3 ms-4">
                      <CircleAlert size={20} className=" text-[#b53325]" />
                      <p className="text-[12px] text-gray-500">
                        Añade un archivo multimedia.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Preview de imágenes subidas con slider */}
              {filePreviews.length > 0 && (
                <div className="mt-6">
                  <div className="w-full aspect-[6/3] mt-3 overflow-hidden rounded-[20px] relative">
                    {/* Fondo borroso */}
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-30"
                      style={{
                        backgroundImage: `url(${filePreviews[currentImageIndex]})`,
                      }}
                    />

                    {/* Imagen principal */}
                    <img
                      className="w-full h-full object-contain relative z-10"
                      alt={`Preview ${currentImageIndex + 1}`}
                      src={filePreviews[currentImageIndex]}
                    />

                    {/* Flecha izquierda */}
                    {filePreviews.length > 1 && (
                      <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 bg-black/70 hover:bg-black/80 text-white rounded-full flex items-center cursor-pointer justify-center transition-colors duration-200"
                        title="Imagen anterior"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Flecha derecha */}
                    {filePreviews.length > 1 && (
                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 z-20 w-8 h-8 bg-black/70 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                        title="Siguiente imagen"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Botón para añadir más imágenes */}
                    <div className="absolute top-3 left-3 z-20">
                      <button
                        type="button"
                        onClick={handleAddMoreImages}
                        className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-[40px] hover:bg-[#4A4947] bg-black/70 text-white text-[12px]"
                      >
                        <Images size={16} />
                        Añadir
                      </button>
                    </div>

                    {/* Input oculto para seleccionar archivos adicionales */}
                    <input
                      aria-label="file-input"
                      ref={additionalInputRef}
                      type="file"
                      accept="image/*,video/mp4"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          handleFiles(Array.from(files));
                        }
                      }}
                    />

                    {/* Botón para eliminar imagen actual */}
                    <button
                      type="button"
                      onClick={() => removeFile(currentImageIndex)}
                      className="absolute top-3 right-3 z-20 w-9 h-9 cursor-pointer hover:bg-[#4A4947] bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      title="Eliminar imagen"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Contador de imágenes */}
                    <div className="absolute bottom-2 right-2 z-20 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {currentImageIndex + 1} / {filePreviews.length}
                    </div>

                    {/* Nombre del archivo */}
                    <div className="absolute bottom-2 left-2 z-20 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {uploadedFiles[currentImageIndex]?.name}
                    </div>

                    {/* Indicadores de posición (dots) */}
                    {filePreviews.length > 1 && (
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                        {filePreviews.map((_, index) => (
                          <button
                            title="Indicador de posición"
                            key={index}
                            type="button"
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="relative mt-8">
                <textarea
                  id="content"
                  placeholder="Cuerpo de texto..."
                  className="peer w-full border text-[14px] text5 px-4 pb-3 pt-7 rounded-[20px] border-[#dbdbdb] placeholder-transparent focus:outline-none focus:border-[#e5a657] focus:border-2"
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={3000}
                  required
                />
                <label
                  htmlFor="content"
                  className={`absolute left-4 text-[#707070] cursor-text transition-all duration-300 ${
                    content
                      ? "top-2 text-[12px] peer-focus:top-2 peer-focus:text-[12px]"
                      : "top-5 text-[14px] peer-focus:top-2 peer-focus:text-[12px]"
                  }`}
                >
                  Cuerpo de texto
                  <span className="text-red">*</span>
                </label>
              </div>

              {/* Botón de publicación */}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={handlePost}
                  type={`${recipe ? "button" : "submit"}`}
                  className={`flex items-center px-5 py-2 rounded-[40px]   text-white text-[14px] ${
                    !content ||
                    !title ||
                    (value === "Image" && uploadedFiles.length === 0)
                      ? "cursor-not-allowed opacity-50 bg-black/70"
                      : "pointer-events-auto cursor-pointer opacity-100 bg-[#0A449B] hover:bg-[#05357e]"
                  }`}
                >
                  {recipe ? "Siguiente" : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contenido Derecho */}
        {step === "2" && (
          <div className="w-[95%] flex-wrap justify-between gap-6 flex p-6">
            <div className="flex-[1] lg:flex-[0.5] h-fit">
              <h1 className="text5 text-[16px] Arvo-Bold mb-3 tracking-tight">
                Información general de la receta
              </h1>
              <div className="flex flex-col bg-white h-full rounded-[20px] px-6 py-8 gap-8">
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
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                            />
                          </svg>
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

                <div className="space-y-2">
                  <p className="text-[14px] text5 tracking-[-0.4px] Arvo-Bold">
                    Nombre de la receta
                  </p>
                  <input
                    aria-label="Nombre de la receta"
                    type="text"
                    placeholder="Ej.: Pollo al Curry Cremoso con Coco"
                    onChange={(e) => setRecipeName(e.target.value)}
                    value={recipeName}
                    className="outline-none p-[10px] border border-gray-300 rounded-[5px] text-[14px] placeholder:text-[13px] w-full"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] text5 tracking-[-0.4px] Arvo-Bold">
                    Descripción de la receta
                  </p>
                  <input
                    aria-label="Descripción de la receta"
                    type="text"
                    placeholder="Ej.: Este plato combina la suavidad y el sabor intenso"
                    onChange={(e) => setRecipeDescription(e.target.value)}
                    value={recipeDescription}
                    className="outline-none p-[10px] border border-gray-300 rounded-[5px] text-[14px] placeholder:text-[13px] w-full"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] text5 tracking-[-0.4px] Arvo-Bold">
                    Tiempo de preparación
                  </p>
                  <div className="flex justify-between gap-4">
                    <input
                      aria-label="Nombre de la receta"
                      type="text"
                      placeholder="Ej.: 45 minutos"
                      onChange={(e) => setRecipeName(e.target.value)}
                      value={recipeName}
                      className="outline-none p-[10px] border border-gray-300 rounded-[5px] text-[14px] placeholder:text-[13px] w-full"
                    />

                  
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-[1] h-fit">
              <h1 className="text5 text-[16px] Arvo-Bold mb-3 tracking-tight">
                Detalles de la receta
              </h1>
              <div className="flex flex-col h-full rounded-[20px]  gap-8">
                <div className="space-y-2 bg-white px-6 py-4 rounded-[10px]">
                  <IngredientsCard />
                </div>
                <div className="space-y-2 bg-white px-6 py-4 rounded-[10px]">
                  <InstructionCard />
                </div>
              </div>
              
            </div>
          </div>
        )}
      </section>
    </UIDashboard>
  );
};

export default UPost;

/*<div className="w-[75%] flex flex-col">
              <div className="relative">
                <img
                  className="object-cover w-full h-[400px] z-10 brightness-75 rounded-[20px]"
                  src="https://hips.hearstapps.com/hmg-prod/images/chicken-stir-fry-lead-6513039282dd4.jpg?crop=1xw:1xh;center,top"
                  alt="Chicken stir fry"
                />
                <div className="absolute bottom-5 left-0 bg-gray ms-4 py-3 px-4 rounded-[10px] max-w-[400px] max-h-[400px]">
                  <input
                    aria-label="Nombre de la receta"
                    type="text"
                    placeholder="Nombre de la receta"
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="text5 text-[20px] w-full Arvo-Bold  outline-none"
                  />

                  <textarea
                    aria-label="Descripción de la receta"
                    placeholder="Descripción de la receta"
                    onChange={(e) => setRecipeDescription(e.target.value)}
                    className="text5 pt-3 w-full text-[13px] outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="w-[25%] bg-gray-100">fd</div> */
