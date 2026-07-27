import Modal from "@/components/modal/Modal";
import Loader from "@/components/ui/feedback/Loader";
import { INGREDIENTS_CACHE_KEY } from "@/hooks/api/recipe/useIngredients";
import { useAuth } from "@/hooks/useAuth";
import type { CommunityTag, FoodCategory, User } from "@/interface/global";
import { update, upload } from "@/services/auth.api";
import { getFoodCategories, getTags } from "@/services/category.api";
import { changeStatus } from "@/services/notification.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import localforage from "localforage";
import {
  Bell,
  Check,
  ChevronRight,
  Lock,
  LogOut,
  Settings,
  ShieldCheck,
  Trash2,
  X,
  Pencil,
} from "lucide-react";
import { useEffect, useState, useRef, Suspense, lazy, startTransition } from "react";
import toast from "react-hot-toast";
import { pickMedia } from "@/utils/media";
import type { UploadableFile } from "@/interface/global.dto";
import { ROUTES } from "@/api/constants/constants";

const ImageCropModal = lazy(() =>
  import("@/components/shared/ImageCropModal").then((module) => ({
    default: module.ImageCropModal,
  }))
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshUser: () => Promise<void>;
  userData: User;
}

export default function SettingsModal({
  isOpen,
  onClose,
  refreshUser,
  userData,
}: SettingsModalProps) {
  const queryClient = useQueryClient();

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<UploadableFile | null>(null);

  const handleFiles = (files: File[]) => {
    const media = pickMedia(files, "image");
    if (media.length === 0) return;

    if (files.length !== 1) return;
    startTransition(() => {
      setFile(media[0]);
    });
  };

  const { mutate: updateProfile, isPending: updatingProfile } = useMutation({
    mutationFn: async (fileToUpload: UploadableFile) => {
      if (!fileToUpload) return;

      const response = await upload(fileToUpload);

      if (!response.success) {
        throw new Error(response.message || "Error al subir la imagen");
      }

      const avatar_url = response.data;
      const updateResponse = await update({ avatar_url: avatar_url as string });

      return updateResponse;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["user", userData.id] });
      const previous = queryClient.getQueryData(["user", userData.id]);

      toast.loading("Actualizando perfil...");

      return { previous };
    },
    onSuccess: (data) => {
      setFile(null);
      toast.dismiss();

      if (data?.data) {
        queryClient.setQueryData(["user", userData.id], data.data);
      }

      refreshUser();
      toast.success("Perfil y avatar actualizados con éxito");
    },
    onError: (e: any, _, context) => {
      toast.dismiss();
      console.error("Error en el proceso de actualización:", e);
      if (context?.previous) {
        queryClient.setQueryData(["user", userData.id], context.previous);
      }
      toast.error(e.message || "Error al actualizar perfil");
    },
  });

  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"preferences" | "account">(
    "preferences",
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    user?.notificationsPref === "ALWAYS",
  );
  const [preferences, setPreferences] = useState<string[]>([]);
  const [backup, setBackup] = useState<string[]>([]);

  useEffect(() => {
    if (!userData?.preferences) return;

    const foodIds = userData.preferences
      .filter((p) => p.food_category_id !== null)
      .map((p) => p.food_category_id as string);

    const tagIds = userData.preferences
      .filter((p) => p.community_tag_id !== null)
      .map((p) => p.community_tag_id as string);

    const merged = [...foodIds, ...tagIds];
    setBackup(merged);
    setPreferences(merged);
  }, [user]);

  const { data: foodCategories = [], isLoading: loadingFood } = useQuery({
    queryKey: ["categories", "food"],
    enabled: isOpen,
    queryFn: async () => {
      const response = await getFoodCategories();
      return response?.data as FoodCategory[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: tagCategories = [], isLoading: loadingTags } = useQuery({
    queryKey: ["categories", "tags"],
    enabled: isOpen,
    queryFn: async () => {
      const response = await getTags();
      return response?.data as CommunityTag[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const togglePreference = (id: string) => {
    setPreferences((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const { mutate: updatePrefs, isPending: isUpdatingPrefs } = useMutation({
    mutationFn: async () => {
      const foodPreferences = preferences.filter((id) =>
        foodCategories.some((c) => c.id === id),
      );
      const communityPreferences = preferences.filter((id) =>
        tagCategories.some((t) => t.id === id),
      );

      const response = await update({
        foodPreferences,
        communityPreferences,
      });

      if (!response?.success) {
        throw new Error(response.message || "Error al actualizar perfil");
      }
      return response.data as User;
    },
    onSuccess: async (updatedUser) => {
      setBackup(preferences);
      queryClient.setQueryData(["user", user?.id], updatedUser);
      await refreshUser();
      toast.success("Preferencias actualizadas");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Error al actualizar perfil");
    },
  });

  const handleToggleNotifications = async (value: boolean) => {
    const originalValue = notificationsEnabled;
    setNotificationsEnabled(value);
    try {
      const response = await changeStatus(
        undefined,
        "user",
        value ? "ALWAYS" : "NONE",
      );
      if (response && response.success) {
        await refreshUser();
        toast.success("Configuración de notificaciones actualizada");
      } else {
        throw new Error(response.message || "Error al actualizar");
      }
    } catch (e: any) {
      setNotificationsEnabled(originalValue);
      toast.error(e.message || "No se pudo actualizar las notificaciones");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      try {
        await logout();
        toast.success("Sesión cerrada");
        window.location.href = ROUTES.AUTH.LOGIN;
      } catch (e) {
        toast.error("Error al cerrar sesión");
      }
    }
  };

  const handleCacheClear = async () => {
    try {
      await localforage.removeItem(INGREDIENTS_CACHE_KEY);
      toast.success("Caché local borrado con éxito");
    } catch (e) {
      toast.error("Error al borrar caché");
    }
  };

  const isEqual =
    backup.length === preferences.length &&
    backup.every((id) => preferences.includes(id));

  const isLoading = loadingFood || loadingTags;

  if (!isOpen || !user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="bg-bg-semi-white rounded-[24px] max-w-[70vw] w-full h-[85vh] md:h-[75vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100"
    >
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-white">
        <div className="flex items-center gap-x-2.5">
          <Settings size={20} className="text-text-3" />

          <h2 className="text-lg font-bold text-text-3">
            Ajustes y Configuración
          </h2>
        </div>
        <button
          onClick={() => {
            setPreferences(backup);
            onClose();
          }}
          className="hover:bg-gray-100 p-2 rounded-full transition cursor-pointer"
        >
          <X size={20} className="text-text-5" />
        </button>
      </div>

      {/* Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-100 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 md:flex-none flex items-center gap-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === "preferences"
                ? "bg-gray-100/70 text-text-3"
                : "text-text-6 hover:bg-gray-50 hover:text-text-3"
            }`}
          >
            <Bell size={18} />
            <span>Preferencias</span>
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex-1 md:flex-none flex items-center gap-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === "account"
                ? "bg-gray-100/70 text-text-3"
                : "text-text-6 hover:bg-gray-50 hover:text-text-3"
            }`}
          >
            <Lock size={18} />
            <span>Cuenta</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 flex flex-col justify-between">
          {activeTab === "preferences" ? (
            <div className="flex-1 flex flex-col gap-y-6">
              {/* Notification preferences */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div className="flex flex-col gap-y-0.5">
                  <h3 className="font-bold text-text-3 text-base">
                    Notificaciones
                  </h3>
                  <p className="text-xs text-text-6">
                    Recibe alertas sobre publicaciones, comentarios y actividad.
                  </p>
                </div>

                {/* Tailwind Switch toggle */}
                <button
                  type="button"
                  onClick={() =>
                    handleToggleNotifications(!notificationsEnabled)
                  }
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notificationsEnabled ? "bg-[#B53325]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Categories and Tags Preferences */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex-1 flex flex-col overflow-hidden">
                <h3 className="font-bold text-text-3 text-base mb-4">
                  Intereses y Preferencias
                </h3>

                {isLoading ? (
                  <div className="flex-1 flex justify-center items-center py-10">
                    <Loader color="#e5a657" size={24} />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-y-6 scrollbar-none">
                    {/* Food Categories */}
                    <div>
                      <h4 className="font-semibold text-text-5 text-sm mb-2.5">
                        Tipos de Comida
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {foodCategories.map((item) => {
                          const isSelected = preferences.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => togglePreference(item.id)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center gap-x-1.5 ${
                                isSelected
                                  ? "bg-text-3 text-white border-text-3"
                                  : "border-gray-200 border-dashed text-text-5 hover:bg-gray-50"
                              }`}
                            >
                              {isSelected && <Check size={12} />}
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tag Categories */}
                    <div>
                      <h4 className="font-semibold text-text-5 text-sm mb-2.5">
                        Tags e Intereses de Comunidad
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tagCategories.map((item) => {
                          const isSelected = preferences.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => togglePreference(item.id)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center gap-x-1.5 ${
                                isSelected
                                  ? "bg-text-3 text-white border-text-3"
                                  : "border-gray-200 border-dashed text-text-5 hover:bg-gray-50"
                              }`}
                            >
                              {isSelected && <Check size={12} />}
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save preferences action */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => updatePrefs()}
                    disabled={isUpdatingPrefs || isEqual}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center gap-x-2 ${
                      isEqual
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-bg-red text-white hover:bg-red-700"
                    }`}
                  >
                    {isUpdatingPrefs ? (
                      <Loader color="#fff" size={14} />
                    ) : (
                      <span>Guardar preferencias</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-y-4">
              {/* User Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-x-4">
                <div className="relative w-14 h-14 rounded-full border border-dashed border-gray-200 overflow-hidden group">
                  <img
                    src={
                      user.avatar_url ||
                      "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
                    }
                    className="w-full h-full object-cover"
                    alt={user.name}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 z-10 hidden group-hover:flex cursor-pointer w-full h-full bg-black/40 items-center justify-center transition-all duration-200"
                  >
                    <Pencil size={14} color="#fff" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-text-3 text-base leading-snug">
                    {user.name}
                  </h3>
                  <p className="text-xs text-text-6">{user.email}</p>
                  <p className="text-xs text-text-6 mt-0.5 capitalize">
                    Proveedor: {user.provider}
                  </p>
                </div>
              </div>

              {/* Account Operations */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col">
                {/* Clear Cache */}
                <button
                  onClick={handleCacheClear}
                  className="w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-x-3.5">
                    <div className="p-2 bg-gray-50 rounded-lg text-text-5">
                      <Trash2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-3 text-sm">
                        Borrar caché local
                      </h4>
                      <p className="text-xs text-text-6">
                        Limpia los ingredientes descargados y refresca datos.
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>

                {/* Terms and conditions */}
                <a
                  href={ROUTES.PUBLIC.TERMS}
                  className="w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-x-3.5">
                    <div className="p-2 bg-gray-50 rounded-lg text-text-5">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-3 text-sm">
                        Términos y condiciones
                      </h4>
                      <p className="text-xs text-text-6">
                        Políticas de uso y privacidad de DualEat.
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </a>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-4 hover:bg-red-50/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-x-3.5">
                    <div className="p-2 bg-red-50 rounded-lg text-bg-red group-hover:bg-red-100">
                      <LogOut size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-bg-red text-sm">
                        Cerrar sesión
                      </h4>
                      <p className="text-xs text-text-6">
                        Salir de tu cuenta actual en este navegador.
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-bg-red opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        hidden
        accept="image/jpeg, image/png, image/webp, image/jpg"
        onChange={(e) => {
          handleFiles(e.target.files ? Array.from(e.target.files) : []);
          e.target.value = "";
        }}
      />

      {file && (
        <Modal
          isOpen={file !== null}
          onClose={() => {
            startTransition(() => {
              setFile(null);
            });
          }}
          className="bg-bg-semi-white rounded-[20px] min-h-[70vh] md:min-h-[50vh] md:max-h-[40vh] md:max-w-[60vw] w-full overflow-hidden flex flex-col"
          overlayClassName="z-[60]"
        >
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <Loader color="#e5a657" size={24} />
              </div>
            }
          >
            <ImageCropModal
              imageSrc={file.uri}
              onSave={(croppedImgUrl) => {
                updateProfile(croppedImgUrl);
              }}
              onClose={() => {
                startTransition(() => {
                  setFile(null);
                });
              }}
              isPending={updatingProfile}
            />
          </Suspense>
        </Modal>
      )}
    </Modal>
  );
}
