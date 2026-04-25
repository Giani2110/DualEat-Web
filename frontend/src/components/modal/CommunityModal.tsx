import React, { useState, useEffect, useRef } from "react";
import { Image, Search, X, Globe, Lock } from "lucide-react";
import RCrop from "../shared/ReactCrop";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import type { CategoryTag, CommunityTag } from "@interface/global";

import { generateSlug } from "@utils/sluglify";

import {
  getCommunityBySlug,
  createCommunity,
} from "@services/community.api";
import { getCommunityTags } from "@services/community-tag.api";
import Loader from "../animation/Loader";

import { StepDots } from "./StepNavigation";

interface Props {
  onClose: () => void;
  user: { id: string; name: string; email: string };
}

const CommunityModal: React.FC<Props> = ({ onClose, user }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // --- Files reales para subir ---
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  // --- Previews para mostrar en el modal ---
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // --- Estado para recorte ---
  const [croppingTarget, setCroppingTarget] = useState<
    "banner" | "icon" | null
  >(null);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryTag[]>([]);
  const [communityTags, setCommunityTags] = useState<CommunityTag[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const [visibility, setVisibility] = useState<
    "public" | "private"
  >("public");

  const [step, setStep] = useState<"1" | "2" | "3" | "4">("1");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Integrated unified confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'success';
    onConfirm: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => { },
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const onPrev = () => {
    if (step === "2") {
      setStep("1");
    } else if (step === "3") {
      setStep("2");
    } else if (step === "4") {
      setStep("3");
    } else {
      onClose();
    }
  };

  const onNext = () => {
    if (step === "1") {
      if (name && description) {
        setStep("2");
      } else {
        toast.error("Por favor, completa todos los campos.");
      }
    } else if (step === "2") {
      setStep("3");
    } else if (step === "3") {
      if (selectedTags.length < 3) {
        toast.error("Por favor, selecciona al menos tres etiquetas.");
        return;
      } else {
        setStep("4");
      }
    }
  };

  const isButtonDisabled = () => {
    if (step === "1") {
      return name.length < 3 || !description || !!error || loading;
    }
    if (step === "3") {
      return selectedTags.length < 3;
    }
    return false;
  };

  const handleSubmit = async () => {
    if (step === "4") {
      const nameFixed = name.replace(/\s+/g, "");
      setName(nameFixed);

      const response = await createCommunity(
        name,
        description,
        bannerFile,
        iconFile,
        visibility,
        selectedTags,
        user.id
      );

      if (response?.success) {
        onClose();
      }
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    setError("");
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        if (name.length >= 3) {
          // --- 1. Generar el SLUG a partir del 'name' ---
          const communitySlug = generateSlug(name);

          // Si el slug resultante es muy corto o solo guiones, podrías añadir una validación aquí
          if (communitySlug.length < 3) return;

          // --- 2. Cambiar la llamada al servicio a buscar por SLUG ---
          const community = await getCommunityBySlug(communitySlug);

          if (community) {
            setError("La comunidad ya existe");
          } else {
            setError("");
          }
        }
      } catch (error) {
        console.error("Error fetching community:", error);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [name]);

  useEffect(() => {
    const fetchCommunityTags = async () => {
      try {
        const response = await getCommunityTags();

        if (response && response.success) {
          const tags = response.data as CommunityTag[];
          setCommunityTags(tags);

          if (tags) {
            const uniqueCategories = tags
              .map((tag) => tag.category)
              .filter(
                (cat, index, self) =>
                  index === self.findIndex((c) => c.id === cat.id)
              );

            if (searchTerm) {
              const filteredCategories = uniqueCategories.filter((category) =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              setCategories(filteredCategories);
              console.log("Filtered categories:", filteredCategories);
            } else {
              setCategories(uniqueCategories);
              console.log("Categories extracted:", uniqueCategories);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching community tags:", error);
      }
    };

    fetchCommunityTags();
  }, [searchTerm]);

  // Función para manejar la selección/deselección de tags
  const handleTagToggle = (tagId: number) => {
    if (selectedTags.length >= 3 && !selectedTags.includes(tagId)) {
      return;
    }
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleTagRemove = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  const handleFileSelect = (file: File, target: "banner" | "icon") => {
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setConfirmModal({
        isOpen: true,
        title: "Archivo demasiado grande",
        message: `El archivo supera los ${maxSizeMB}MB. Por favor, subí uno más liviano.`,
        type: "warning",
        onConfirm: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    // Genero URL temporal y abro RCrop
    const url = URL.createObjectURL(file);
    setTempImage(url);
    setCroppingTarget(target);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-[20px] box-border py-4 px-5 shadow-md z-10 w-full max-w-[800px] h-fit">
        {step === "1" && (
          <>
            <h2 className="text-[21px] text3 Dosis-Bold tracking-tight">
              Cuéntanos sobre tu comunidad
            </h2>
            <p className="text-[13px] text6 tracking-tight mt-3">
              Comparte detalles sobre tu comunidad, como su nombre, propósito y
              actividades.
            </p>

            <div className="flex w-full gap-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onNext();
                }}
                className="py-8 flex w-[60%] flex-col gap-10"
              >
                <div className="relative">
                  <input
                    type="text"
                    id="community-name"
                    placeholder="Nombre de la comunidad"
                    className={`peer w-full text-[14px] text5 px-4 pb-4 pt-6 rounded-[20px] bg-[#faf5f0] focus:border-2 placeholder-transparent focus:outline-none  ${name.length < 3
                        ? "border-[red]"
                        : "focus:border-[#e5a657]"
                      }`}
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    maxLength={21}
                    required
                  />
                  <label
                    htmlFor="community-name"
                    className={`absolute left-5 text-[#707070] cursor-text transition-all duration-300
                ${name ? "top-[7px] text-[11px]" : "top-[20px] text-[13px]"}
                peer-focus:top-[7px] peer-focus:text-[12px] 
                `}
                  >
                    Nombre de la comunidad <span className="text-red">*</span>
                  </label>

                  <div
                    className={`flex gap-10 px-3 mt-3 ${name.length < 3 || error || loading
                        ? "justify-between"
                        : "justify-end"
                      }`}
                  >
                    {name.length < 3 ? (
                      <span className="text-[12px] text6">
                        El nombre debe tener entre 3 y 21 caracteres.
                      </span>
                    ) : loading ? (
                      <div className="flex gap-2 items-center">
                        <Loader color="yellow" />
                        <span className="text-[12px] text6">
                          Verificando disponibilidad...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-[12px] text6">{error}</span>
                      </div>
                    ) : null}

                    <span className="text-[11px] text6">
                      {21 - name.length}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    id="community-description"
                    placeholder="Descripción de la comunidad"
                    className={`peer w-full text-[13px] text5 h-[200px] px-4 pb-4 pt-7  rounded-[15px] bg-[#faf5f0] focus:border-2 placeholder-transparent focus:outline-none focus:border-[#e5a657]`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="community-description"
                    className={`absolute left-5 text-[#707070] cursor-text transition-all duration-300
                ${description
                        ? "top-[10px] text-[12px]"
                        : "top-[20px] text-[13px]"
                      }
                peer-focus:top-[10px] peer-focus:text-[12px] 
                `}
                  >
                    Descripción <span className="text-red">*</span>
                  </label>
                  <div
                    className={`flex gap-10 px-3 mt-1 ${description.length > 500
                        ? "justify-between"
                        : "justify-end"
                      }`}
                  >
                    {description.length > 500 && (
                      <span className="text-[12px] text6">
                        La descripción es demasiado larga.
                      </span>
                    )}
                    <span className="text-[11px] text6">
                      {description.length}
                    </span>
                  </div>
                </div>
              </form>

              <div className="w-[40%]">
                <div className="bg-white mt-5 max-w-[300px] shadow-md/30 box-border overflow-hidden flex flex-col rounded-[20px] py-4 px-5">
                  <div className="ps-1 leading-6 tracking-tight">
                    <h3 className="text-[19px] text3 tracking-tighter whitespace-pre-line break-words">
                      {name ? name : "Nombre de la comunidad"}
                    </h3>
                    <span className="text-[11.5px] text6">1 Miembro</span>
                  </div>

                  <p className="text-[13px] max-w-[240px] text4 tracking-tight mt-3 whitespace-pre-line break-words">
                    {description ? description : "Descripción de tu comunidad"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {step === "2" && (
          <>
            <h2 className="text-[21px] text3 Dosis-Bold tracking-tight">
              Dale un diseño a tu comunidad
            </h2>

            {croppingTarget && tempImage ? (
              <RCrop
                src={tempImage}
                onCancel={() => {
                  setCroppingTarget(null);
                  setTempImage(null);
                }}
                onComplete={async (blob) => {
                  const file = new File([blob], `${croppingTarget}.jpeg`, {
                    type: "image/jpeg",
                  });
                  const previewUrl = URL.createObjectURL(file);

                  if (croppingTarget === "banner") {
                    setBannerFile(file);
                    console.log(bannerFile);
                    setBannerPreview(previewUrl);
                  } else {
                    setIconFile(file);
                    console.log(iconFile);
                    setIconPreview(previewUrl);
                  }

                  setCroppingTarget(null);
                  setTempImage(null);
                }}
                type={croppingTarget}
              />
            ) : (
              <>
                <p className="text-[13px] text6 tracking-tight mt-3">
                  Añadir un banner ayudará a captar la atención de nuevos
                  miembros y a consolidar tu propia comunidad gastronómica.
                  Puedes actualizar esto en cualquier momento.
                </p>

                <div className="flex w-full gap-10">
                  <div className="py-10 w-[50%] flex flex-col">
                    {/* Banner */}
                    <div className="flex justify-between items-center py-2">
                      <h3 className="text-[13px] text4 tracking-tighter">
                        Banner
                      </h3>
                      <button
                        type="button"
                        className="bg-gray cursor-pointer flex items-center gap-2 text-white px-4 py-2 rounded-md"
                        onClick={() => {
                          const input = document.querySelector(
                            'input[aria-label="Banner"]'
                          ) as HTMLInputElement | null;
                          if (input) input.click();
                        }}
                      >
                        <Image size={20} color="#707070" />
                        <span className="text-[12px] text6">Subir</span>
                      </button>
                      <input
                        aria-label="Banner"
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file, "banner");
                        }}
                      />
                    </div>
                    {bannerPreview === null && (
                      <div className="flex items-center gap-2">
                        <p>ff</p>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="flex justify-between items-center py-2">
                      <h3 className="text-[13px] text4 tracking-tighter">
                        Ícono
                      </h3>
                      <button
                        type="button"
                        className="bg-gray cursor-pointer flex items-center gap-2 text-white px-4 py-2 rounded-md"
                        onClick={() => {
                          const input = document.querySelector(
                            'input[aria-label="Icon"]'
                          ) as HTMLInputElement | null;
                          if (input) input.click();
                        }}
                      >
                        <Image size={20} color="#707070" />
                        <span className="text-[12px] text6">Subir</span>
                      </button>
                      <input
                        aria-label="Icon"
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file, "icon");
                        }}
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="w-[50%]">
                    <div className="bg-white mt-5 shadow-md/30 box-border overflow-hidden flex flex-col rounded-[20px] whitespace-pre-line break-words">
                      <div
                        className="w-full h-10"
                        style={
                          bannerPreview === null
                            ? { backgroundColor: "#e5a657" }
                            : {
                              backgroundImage: `url(${bannerPreview})`,
                              backgroundSize: "cover",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                            }
                        }
                      />
                      <div className="leading-6 tracking-tight items-center flex flex-wrap gap-4 px-5 pt-5">
                        <img
                          src={
                            iconPreview
                              ? iconPreview
                              : "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                          }
                          alt="Icon"
                          className="object-cover rounded-full w-10 h-10"
                        />
                        <div>
                          <h3 className="text-[17px] text3 tracking-tight max-w-[300px]">
                            {name ? name : "Nombre de la comunidad"}
                          </h3>
                          <span className="text-[11.5px] text6">1 Miembro</span>
                        </div>
                      </div>

                      <p className="text-[13px] text4 tracking-tight mt-3 max-w-[90%] px-5 pb-5">
                        {description
                          ? description
                          : "Descripción de tu comunidad"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {step === "3" && (
          <div>
            <h2 className="text-[21px] text3 Dosis-Bold tracking-tight">
              Etiquetas de la comunidad
            </h2>
            <p className="text-[13px] text6 tracking-tight mt-3 mb-6">
              Selecciona las etiquetas que mejor describan tu comunidad.
            </p>
            <div className="mt-2">
              <div className="mb-6">
                <div
                  onClick={focusInput}
                  className="mb-6 gap-2 flex w-full px-10 py-3 bg-[#f5f5f5] cursor-text items-center rounded-full focus:outline-none focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#e5a657]"
                >
                  <Search size={18} className=" text-[#e5a657]" />
                  <input
                    ref={inputRef}
                    type="text"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar categorías"
                    className=" text-[13px] text5 outline-none"
                  />
                </div>
                {/* Contador de temas seleccionados */}
                <div className="my-5 flex flex-wrap gap-2">
                  <span className="text-[14px] text3 Dosis-Bold tracking-wide">
                    Temas: {selectedTags.length}/3
                  </span>
                </div>
                <div className="mb-6 flex gap-2 flex-wrap">
                  {selectedTags.map((tagId) => {
                    const tag = communityTags.find((t) => t.id === tagId);
                    return (
                      tag && (
                        <div
                          key={tag.id}
                          onClick={() => handleTagRemove(tag.id)}
                          className="flex gap-2 w-fit items-center cursor-pointer border border-[#dbdbdb] rounded-[5px] px-2 py-[6px]"
                        >
                          <span className=" text-[12px] text-black ">
                            {tag.name}
                          </span>
                          <span className="p-[3px] rounded-full bg-black">
                            <X
                              size={12}
                              strokeWidth={2.9}
                              className="text-[#ffffff]"
                            />
                          </span>
                        </div>
                      )
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Categorías expandibles */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {categories.map((category) => {
                      const categoryTags = communityTags.filter(
                        (tag) => tag.category_id === category.id
                      );

                      return (
                        <div
                          key={category.id}
                          className="border-b border-gray-100 pb-4"
                        >
                          {/* Header de categoría */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-[16px]">
                              {category.icon_url}
                            </span>
                            <h3 className="text-[15px] text4 font-medium tracking-tight">
                              {category.name}
                            </h3>
                          </div>

                          {/* Tags de la categoría */}
                          <div className="flex flex-wrap gap-2 ml-7">
                            {categoryTags.map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id)}
                                className={`px-3 py-1.5 rounded-full cursor-pointer text-[12px] transition-colors border ${selectedTags.includes(tag.id)
                                    ? "bg-[#e5a657] text-white border-[#e5a657]"
                                    : "bg-gray-100 text-[#707070] border-gray-200 hover:bg-gray-200"
                                  }`}
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "4" && (
          <div>
            <h2 className="text-[21px] text3 Dosis-Bold tracking-tight">
              ¿Qué tipo de comunidad es esta?
            </h2>
            <p className="text-[13px] text6 tracking-tight mt-3 leading-5 mb-6">
              Decide quién puede ver tu comunidad y colaborar en ella. Sólo las
              comunidades públicas aparecen en la búsqueda.
              <span className="Dosis-Bold text5"> Importante:</span> Una vez
              configurado, deberás enviar una solicitud para cambiar el tipo de
              tu comunidad.
            </p>

            <div className="flex flex-col">
              <div
                onClick={() => setVisibility("public")}
                className={`flex gap-2 items-center rounded-[2px] cursor-pointer px-5 py-4 ${visibility === "public" ? "bg-gray-100" : ""
                  }`}
              >
                {visibility === "public" ? (
                  <Globe
                    strokeWidth={1.9}
                    fill="#e5a657"
                    className={`text-[20px] mr-2`}
                  />
                ) : (
                  <Globe className={`text-[20px] text-[#e5a657] mr-2`} />
                )}
                <div className="flex flex-col items-start tracking-tight">
                  <span className="text-[13px] text5">Pública</span>
                  <span className="text-[12px] text6">
                    Cualquiera puede ver, publicar y comentar en esta comunidad
                  </span>
                </div>
                <input
                  title="Visibilidad pública"
                  type="radio"
                  name="visibility"
                  onChange={() => setVisibility("public")}
                  value="public"
                  checked={visibility === "public"}
                  className="ml-auto  cursor-pointer accent-black w-[15px] h-[15px]"
                />
              </div>
              <div
                onClick={() => setVisibility("private")}
                className={`flex gap-2 items-center rounded-[2px] cursor-pointer px-5 py-4 ${visibility === "private" ? "bg-gray-100" : ""
                  }`}
              >
                {visibility === "private" ? (
                  <Lock
                    strokeWidth={1.9}
                    fill="#e5a657"
                    className={`text-[#2f2f2f] text-[20px] mr-2`}
                  />
                ) : (
                  <Lock className={`text-[20px] text-[#e5a657] mr-2`} />
                )}
                <div className="flex flex-col items-start tracking-tight">
                  <span className="text-[13px] text5">Privada</span>
                  <span className="text-[12px] text6">
                    Cualquiera puede ver, pero sólo los usuarios aprobados
                    pueden colaborar
                  </span>
                </div>
                <input
                  title="Visibilidad privada"
                  type="radio"
                  name="visibility"
                  onChange={() => setVisibility("private")}
                  value="private"
                  checked={visibility === "private"}
                  className="ml-auto  cursor-pointer accent-black w-[15px] h-[15px]"
                />
              </div>
            </div>
          </div>
        )}

        {!croppingTarget && (
          <div
            className={`w-full flex justify-between items-center px-5 ${step === "1" ? "mt-0" : "mt-10"
              }`}
          >
            <StepDots step={parseInt(step)} />

            <div className="flex gap-3">
              <button
                onClick={onPrev}
                type="button"
                className="text-[13px] text3 tracking-tight bg-gray px-5 py-2 rounded-[40px] cursor-pointer"
              >
                {step === "1" ? "Cerrar" : "Volver"}
              </button>
              <button
                id="next-button"
                onClick={() => (step === "4" ? handleSubmit() : onNext())}
                type="button"
                // Apply a disabled class and the disabled attribute
                className={`text-[13px] text1 tracking-tight bg-yellow px-5 py-2 rounded-[40px] ${isButtonDisabled()
                    ? "brightness-90 opacity-50 cursor-not-allowed"
                    : "brightness-100 opacity-100 cursor-pointer"
                  }`}
                disabled={isButtonDisabled()}
              >
                {step !== "4" ? "Siguiente" : "Crear comunidad"}
              </button>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmText={confirmModal.confirmText}
        />
      </div>
    </div>
  );
};

export default CommunityModal;
