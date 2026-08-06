import { useState, useEffect, useRef, useMemo } from "react";

import { ChevronsUpDown, Plus, X } from "lucide-react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import { createPost, upload } from "@/services/post.api";

import toast from "react-hot-toast";

import type { PostDTO, UploadableFile } from "@interface/global.dto";
import type { Community } from "@interface/global";

import "@assets/scss/private/users/users.scss";
import { CustomToolbar } from "@/components/shared/EditorToolbar";
import { pickMedia } from "@/utils/media";
import { usePostCreateStore } from "@/context/store/usePostCreate";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import ImagesCarousel from "@/components/shared/ImagesCarousel";
import { getMimeTypeFromUrl } from "@/utils/capitalize";
import { useMutation } from "@tanstack/react-query";
import Loader from "@/components/ui/feedback/Loader";
import CommunitySearch from "@/components/features/create/post/CommunitySearch";
import RecipeSideModal from "@/components/features/recipe/RecipeSideModal";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useUpdatePost } from "@/hooks/api/post/usePost";

const customCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');

  .ProseMirror p {
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    color: #4A4947;
    line-height: 1.5;
    margin-top: 0;
  }

  .ProseMirror p.is-empty:first-child::before {
    content: attr(data-placeholder);
    color: #707070; 
    font-size: 15px;
    font-family: 'Outfit', sans-serif;
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
    font-family: 'Outfit', sans-serif;
  }

  .ProseMirror strong {
    font-weight: 700;
  }

  .ProseMirror s {
    text-decoration: line-through;
  }
`;

export default function CreatePost() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { post, setPost, clearPost } = usePostCreateStore();

  const { mutateAsync: updatePost } = useUpdatePost();

  const fileInputRef = useRef<any>(null);

  const isEditing = useMemo(() => post.id !== "", [post.id]);

  const [title, setTitle] = useState<string>(post?.title || "");
  const [content, setContent] = useState<string>(post?.content || "");

  const [image_urls, setImageUrls] = useState<UploadableFile[]>(() => {
    return (post?.image_urls || []).map((item) => {
      if (typeof item === "string") {
        return {
          file: null as any,
          uri: item,
        };
      }
      return item;
    });
  });

  const [community, setCommunity] = useState<Community | null>(
    post?.community || null,
  );

  const [open, setOpen] = useState({
    community: false,
    recipe: false,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({
        placeholder: "Empieza a escribir...",
      }),
    ],
    content: post?.content || "",
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

  const { mutate: mutatePost, isPending } = useMutation({
    mutationFn: async () => {
      let urls: string[] = [];

      // Solo subimos imágenes si no estamos en modo edición
      if (!isEditing && image_urls.length > 0) {
        const uploadPayload = { post_images: image_urls };

        try {
          const response = await upload(uploadPayload);

          if (response.success && response.data?.post_images) {
            urls = response.data.post_images;
          } else {
            throw new Error(
              response.message || "No se pudieron subir las imágenes",
            );
          }
        } catch (err: any) {
          throw new Error(err.message || "Error al subir las imágenes");
        }
      }

      const postDTO: PostDTO = {
        id: isEditing ? usePostCreateStore.getState().post.id : undefined,
        title: title.trim(),
        content: content.trim(),
        image_urls: urls,
        community: community,
        recipe: post.recipe || null,
      };

      return toast.promise(
        (async () => {
          const res = isEditing
            ? await updatePost({ data: postDTO })
            : await createPost(postDTO);
          if (!res.success) {
            throw new Error(
              res.message ||
                (isEditing
                  ? "Error al actualizar el post"
                  : "Error al crear el post"),
            );
          }
          return res;
        })(),

        {
          loading: isEditing ? "Actualizando post..." : "Creando post...",
          success: (res) =>
            res.message ||
            (isEditing
              ? "Post actualizado exitosamente"
              : "Post creado exitosamente"),

          error: (res) =>
            res.message ||
            (isEditing
              ? "Error al actualizar el post"
              : "Error al crear el post"),
        },
      );
    },
    onSuccess: (res) => {
      clearPost();
      navigate(ROUTES.USER.POST(res.data?.id as string, res.data?.slug || ""));
    },
  });

  const handleFiles = (files: File[], type: "image" | "video") => {
    const media = pickMedia(files, type);
    if (media.length === 0) return;

    const hasVideo = !!video;
    const imageCount = onlyImages.length;

    if (type === "image") {
      if (imageCount >= 10 || hasVideo) return;
      setImageUrls((prev) => [...prev, ...media]);
    } else if (type === "video") {
      if (imageCount > 0 || hasVideo) return;
      setImageUrls((prev) => [...prev, media[0]]);
    }
  };

  const handleSubmit = async () => {
    if (!content || content === "<p></p>" || !title) {
      toast.error("Título o descripción vacío");
      return;
    }

    if (!community) {
      toast.error("Comunidad no seleccionada");
      return;
    }

    mutatePost();
  };

  const removeFile = (index: number) => {
    const newImages = image_urls.filter((_, i) => i !== index);
    setImageUrls(newImages);
  };

  const video =
    image_urls.find((item) => {
      return item.file
        ? item.file.type.startsWith("video/")
        : getMimeTypeFromUrl(item.uri) === "video";
    }) || null;

  const onlyImages = image_urls.filter((item) => {
    return item.file
      ? !item.file.type.startsWith("video/")
      : getMimeTypeFromUrl(item.uri) !== "video";
  });

  const isPremium =
    user?.subscription_status === "ACTIVE" ||
    user?.subscription_status === "TRIAL";

  return (
    <main className="h-full flex flex-col px-6 md:px-16 gap-y-6 my-5 bg-bg-semi-white">
      <h1 className="text-2xl md:text-[28px] text-text-3 tracking-tight font-bold">
        {isEditing ? "Editar post" : "Crear post"}
      </h1>

      <div className="flex flex-col md:flex-row items-center gap-2">
        <button
          type="button"
          disabled={isEditing}
          onClick={() => setOpen({ ...open, community: true })}
          className="flex items-center gap-x-2.5 bgsemi-white border border-[#e5a657] px-4 py-2 rounded-full cursor-pointer w-full md:w-fit"
        >
          {community && (
            <img
              src={community.image_url}
              alt="Imagen de la comunidad"
              className="w-5 h-5 rounded-full object-cover"
            />
          )}

          <span className="text-[14px] text4 tracking-tight">
            {(community && community.name) || "Seleccionar comunidad"}
          </span>

          <ChevronsUpDown size={16} className="text-[#333333]" />
        </button>

        <button
          type="button"
          onClick={() => setOpen({ ...open, recipe: true })}
          className="flex cursor-pointer flex-row border border-dashed border-[#dbdbdb] hover:border-[#e5a657] items-center px-4 gap-x-2 py-2 rounded-full w-full md:w-fit"
        >
          {!post.recipe ? (
            <>
              <Plus size={18} color="#e5a657" />
              <span className="text-text-3 font-normal text-[13px]">
                ¿Vincular una receta?
              </span>
            </>
          ) : (
            <>
              <img
                src={
                  (post.recipe && post.recipe.main_image) ||
                  "https://placehold.co/50x50.png"
                }
                alt="Imagen de la comunidad"
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-text-3 font-normal text-[13px]">
                {post.recipe.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPost({ ...post, recipe: null });
                }}
                className="cursor-pointer group hover:bg-[#B53325] p-0.5 rounded-full transition-all duration-200"
              >
                <X size={14} className="group-hover:text-[#fff]" />
              </button>
            </>
          )}
        </button>
      </div>

      {/* FORMULARIO PRINCIPAL */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col gap-y-6"
      >
        <div className="relative">
          <input
            id="post-title"
            type="text"
            placeholder="Título*"
            value={title}
            className="w-full border font-semibold text-base text-text-5 px-4 py-3 rounded-[10px] outline-none border-[#dbdbdb] focus:border-[#e5a657] focus:border-2"
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            required
          />
        </div>

        {/* PREVIEW DE IMÁGENES */}
        {image_urls.length > 0 && (
          <ImagesCarousel
            media={image_urls}
            add={isEditing ? undefined : () => fileInputRef.current?.click()}
            remove={isEditing ? undefined : (index) => removeFile(index)}
          />
        )}

        {/* INPUT CONTENIDO */}
        <div className="border border-[#dbdbdb] focus-within:border-[#e5a657] focus-within:border-2 rounded-[10px] overflow-hidden flex flex-col resize-y min-h-[100px] max-h-[400px]">
          <CustomToolbar
            editor={editor}
            images={onlyImages}
            video={video}
            handleFiles={isEditing ? undefined : handleFiles}
          />

          <div className="flex-grow overflow-y-auto">
            <EditorContent
              editor={editor}
              maxLength={isPremium ? 1000 : 300}
              className="cursor-text h-full outline-none text-base"
              onClick={() => {
                editor?.commands.focus();
              }}
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/jpeg, image/png, image/webp, image/jpg"
            onChange={(e) => {
              handleFiles(
                e.target.files ? Array.from(e.target.files) : [],
                "image",
              );
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>

        {/* BOTÓN DE PUBLICACIÓN */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !content || !title}
            className={`flex items-center px-4 py-1.5 font-bold bg-bg-semi-black rounded-full text-base gap-x-2 ${
              isPending || !content || !title
                ? "cursor-not-allowed opacity-50 text-text-1"
                : "pointer-events-auto cursor-pointer hover:bg-[#4A4947] text-text-1"
            }`}
          >
            {isPending && <Loader size={16} color="#fff" />}

            {isPending
              ? isEditing
                ? "Guardando..."
                : "Publicando..."
              : "Publicar"}
          </button>
        </div>
      </form>

      {open.community && (
        <CommunitySearch
          isOpen={open.community}
          onClose={() => setOpen({ ...open, community: false })}
          setCommunity={setCommunity}
        />
      )}

      {open.recipe && (
        <div style={{ zIndex: 999 }} className="fixed inset-0">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
            onClick={() => {
              setOpen({ ...open, recipe: false });
            }}
          />

          <motion.aside
            style={{ zIndex: 1000 }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="absolute right-0 top-0 h-full w-[85vw] sm:w-[400px] bg-bg-semi-white p-3 border-l border-gray-300 shadow-2xl overflow-y-auto flex flex-col gap-y-3"
          >
            <RecipeSideModal
              onClose={() => setOpen({ ...open, recipe: false })}
              recipe={post.recipe || undefined}
              onSelectRecipe={(rec) => {
                setPost({ ...post, recipe: rec });
                setOpen({ ...open, recipe: false });
              }}
            />
          </motion.aside>
        </div>
      )}
    </main>
  );
}
