import { useState, useEffect, useRef, useMemo } from "react";

import { ChevronsUpDown, SquareCheckBig, SquareDashed } from "lucide-react";

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
  const { post, setPost, clearPost } = usePostCreateStore();

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

  const [open, setOpen] = useState<boolean>(false);
  const [withRecipe, setWithRecipe] = useState(false);

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

      if (image_urls.length > 0) {
        const uploadPayload = { post_images: image_urls };

        const response = await upload(uploadPayload);

        if (response?.success && response?.data) {
          urls = response.data.post_images || [];
        }
      }

      const post: PostDTO = {
        id: isEditing ? usePostCreateStore.getState().post.id : undefined,
        title: title.trim(),
        content: content.trim(),
        image_urls: urls,
        community: community,
      };

      return toast.promise(
        (async () => {
          const res = await createPost(post);
          if (!res.success) {
            throw new Error(res.message || "Error al crear el post");
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

    if (withRecipe) {
      const post: PostDTO = {
        title: title,
        content: content,
        image_urls: image_urls,
        community: community,
      };

      toast.loading("Navegando a crear receta");
      setPost(post);
      toast.dismiss();
      navigate(ROUTES.USER.CREATE_RECIPE);
    } else {
      mutatePost();
    }
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

  return (
    <main className="h-full flex flex-col px-6 md:px-16 gap-y-6 my-5 bg-bg-semi-white">
      <h1 className="text-[28px] text3 tracking-tight font-bold">
        {isEditing ? "Editar post" : "Crear post"}
      </h1>

      <div className="flex flex-row items-center gap-x-2">
        <button
          type="button"
          disabled={isEditing}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-x-2.5 bgsemi-white border border-[#e5a657] px-4 py-2 rounded-full cursor-pointer w-fit"
        >
          <img
            src={
              (community && community.image_url) ||
              "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
            }
            alt="Imagen de la comunidad"
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-[14px] text4 tracking-tight">
            {(community && community.name) || "Seleccionar comunidad"}
          </span>

          <ChevronsUpDown size={16} className="text-[#333333]" />
        </button>
        <button
          onClick={() => setWithRecipe(!withRecipe)}
          disabled={isEditing}
          className={`flex cursor-pointer flex-row border items-center justify-between px-4 gap-x-2 py-2 rounded-full cursor-pointer 
            ${withRecipe ? "border-[#e5a657]" : "border-dashed border-[#dbdbdb]"}
            ${isEditing && "hidden"}`}
        >
          <div className="flex flex-row items-center gap-x-3">
            <svg
              width={22}
              height={22}
              viewBox="0 0 640 640"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#707070"
                d="M480 576L192 576C139 576 96 533 96 480L96 160C96 107 139 64 192 64L496 64C522.5 64 544 85.5 544 112L544 400C544 420.9 530.6 438.7 512 445.3L512 512C529.7 512 544 526.3 544 544C544 561.7 529.7 576 512 576L480 576zM192 448C174.3 448 160 462.3 160 480C160 497.7 174.3 512 192 512L448 512L448 448L192 448zM224 216C224 229.3 234.7 240 248 240L424 240C437.3 240 448 229.3 448 216C448 202.7 437.3 192 424 192L248 192C234.7 192 224 202.7 224 216zM248 288C234.7 288 224 298.7 224 312C224 325.3 234.7 336 248 336L424 336C437.3 336 448 325.3 448 312C448 298.7 437.3 288 424 288L248 288z"
              />
            </svg>
            <span className="text-text-3 font-normal text-[13px]">
              ¿Tiene receta?
            </span>
          </div>

          {withRecipe ? (
            <SquareCheckBig size={18} color="#e5a657" />
          ) : (
            <SquareDashed size={18} color="#e5a657" />
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
              : withRecipe
                ? "Siguiente"
                : "Publicar"}
          </button>
        </div>
      </form>

      {open && (
        <CommunitySearch
          isOpen={open}
          onClose={() => setOpen(false)}
          setCommunity={setCommunity}
        />
      )}
    </main>
  );
}
