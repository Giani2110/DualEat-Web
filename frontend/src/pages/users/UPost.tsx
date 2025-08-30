import React, { useState, useEffect, useRef } from "react";

import { useAuth } from "../../hooks/useAuth";
import { getUserCommunities } from "../../services/community.api";
import { Search, ChevronDown } from "lucide-react";
import UIDashboard from "../../components/users/UIDashboard";

import type { Community } from "../../interface/global";

import "../../assets/scss/users/users.scss";

type UserCommunityEntry = {
  community: Community;
  is_moderator: boolean;
  joined_at: string;
};

const UPost: React.FC = () => {
  const { user } = useAuth();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [value, setValue] = useState<"Text" | "Image">("Text");

  const [joinedCommunities, setJoinedCommunities] = useState<
    UserCommunityEntry[]
  >([]);

  const [selected, setSelected] = useState<Community | null>(null);

  const [button, setButton] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

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

  const removeFile = (index: number) => {
    // Liberar la URL del objeto para evitar memory leaks
    URL.revokeObjectURL(filePreviews[index]);

    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      const communities = await getUserCommunities(user.id);

      if (communities && communities.success) {
        setJoinedCommunities(communities.data as UserCommunityEntry[]);
        console.log("Joined communssssities:", communities.data);
      }
    };
    fetchCommunities();
  }, [user]);

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
      <div className="w-[60%] my-10 ">
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
            className="flex flex-col hover:bg-[#dbdbdb] cursor-pointer px-4 pt-3 rounded-[5px] items-center gap-2"
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
            className="flex hover:bg-[#dbdbdb] cursor-pointer px-4 pt-3 flex-col rounded-[5px] items-center gap-2"
            type="button"
          >
            <span>Imágenes y video</span>
            <span
              className={`h-[4px] ${
                value === "Image" && "rounded-full w-[90%]  bg-[#e5a657]"
              }`}
            />
          </button>
        </div>

        {/** Formulario */}
        <form className="flex flex-col">
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

          {value === "Image" && filePreviews.length === 0 && (
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
                      className="text-[14px] text-[#e5a657] hover:text-[#d4941f] font-medium underline mt-1"
                      onClick={() => {
                        const input = document.getElementById("file-input");
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
          )}

          
          {/* Preview de imágenes subidas */}
          {filePreviews.length > 0 && (
            <div className="mt-6 space-y-4">
              {filePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="w-full aspect-[7/3] mt-3 overflow-hidden rounded-[20px] relative"
                >
                  {/* Fondo borroso */}
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-50"
                    style={{
                      backgroundImage: `url(${preview})`,
                    }}
                  />

                  {/* Imagen principal */}
                  <img
                    className="w-full h-full object-contain cursor-pointer relative z-10"
                    alt={`Preview ${index + 1}`}
                    src={preview}
                  />

                  {/* Botón para eliminar */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 z-20 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                    title="Eliminar imagen"
                  >
                    ×
                  </button>

                  {/* Nombre del archivo */}
                  <div className="absolute bottom-2 left-2 z-20 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {uploadedFiles[index]?.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="relative mt-8">
            <textarea
              id="content"
              placeholder="Descripción"
              className="peer w-full border text-[14px] text5 px-4 pb-3 pt-7 rounded-[20px] border-[#dbdbdb] placeholder-transparent focus:outline-none focus:border-[#e5a657] focus:border-2"
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
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
        </form>
      </div>
    </UIDashboard>
  );
};

export default UPost;
