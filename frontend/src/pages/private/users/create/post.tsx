import { useState, useEffect, useRef, useCallback } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ImagePlus,
  SquareCheckBig,
  SquareDashed,
  Trash2,
} from "lucide-react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import { createPost } from "@/services/post.api";

import toast from "react-hot-toast";

import type { PostDTO, UploadableFile } from "@interface/global.dto";
import type { Community } from "@interface/global";

import "@assets/scss/private/users/users.scss";
import { CustomToolbar } from "@/components/shared/EditorToolbar";
import { pickMedia } from "@/utils/media";
import { usePostCreateStore } from "@/context/store/usePostCreate";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";

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

export default function CreatePost() {
  const fileInputRef = useRef<any>(null);

  const navigate = useNavigate();
  const { setPost } = usePostCreateStore();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [images, setImages] = useState<UploadableFile[]>([]);
  const [video, setVideo] = useState<UploadableFile | null>(null);

  const [community, setCommunity] = useState<Community | null>(null);

  const [withRecipe, setWithRecipe] = useState(false);

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

  // SEPARAR
  const [index, setIndex] = useState<number>(0);

  const remove = useCallback(
    (index: number, type: "image" | "video") => {
      if (type === "image") {
        setImages(images.filter((_, i) => i !== index));
      } else {
        setVideo(null);
      }
    },
    [images],
  );

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

  const handleFiles = (files: File[], type: "image" | "video") => {
    const media = pickMedia(files, type);
    if (media.length === 0) return;

    if (type === "image") {
      if (images.length >= 10 || video !== null) return;
      setImages((prev) => [...prev, ...media]);
    } else if (type === "video") {
      if (images.length > 0) return;
      setVideo(media[0]);
    }
  };

  const handleNextImage = () => {
    if (index < images.length - 1) {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const handlePrevImage = () => {
    if (index > 0) {
      setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  const handleSubmit = async () => {
    // TODO: Toast

    if (!content || content === "<p></p>" || !title) {
      console.log("El editor está vacío");
      return;
    }

    if (withRecipe) {
      const post: PostDTO = {
        title: title,
        content: content,
        image_urls: images
          ? images.map((image) => image)
          : video
            ? [video]
            : [],
        community_id: community?.id || null,
      };

      setPost(post);

      console.log("POST", JSON.stringify(post, null, 2));

      navigate(ROUTES.USER.CREATE_RECIPE);
    }
  };

  return (
    <section className="flex flex-col gap-y-6 mt-8 w-[90%] mx-auto">
      <h1 className="text-[28px] text3 tracking-tight font-bold">Crear post</h1>

      <div className="flex flex-row items-center gap-x-2">
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
        <button
          onClick={() => setWithRecipe(!withRecipe)}
          className={`flex cursor-pointer flex-row border items-center justify-between px-4 gap-x-2 py-2 rounded-full cursor-pointer  ${withRecipe ? "border-[#e5a657]" : "border-dashed border-[#dbdbdb]"}`}
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
            type="text"
            placeholder="Título"
            className="peer w-full border text-[14px] text5 px-4 pb-2 pt-6 rounded-[20px] border-[#dbdbdb] placeholder-transparent focus:outline-none focus:border-[#e5a657] focus:border-2"
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
        {images.length > 0 && (
          <div className="flex justify-center items-center aspect-[12/2] mt-3 overflow-hidden rounded-[15px] relative group">
            <button
              type="button"
              disabled={images.length >= 10}
              className={`absolute top-4 left-4 bgsemi-black border border-gray-200 rounded-full px-2 py-1 flex flex-row items-center gap-x-2 z-10 ${images.length >= 10 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={(e) => {
                e.preventDefault();
                fileInputRef.current?.click();
              }}
            >
              <ImagePlus size={16} color="#fff" />
              <p className="text-text-1 text-[13px]">Agregar</p>
            </button>

            <button
              onClick={() => remove(index, "image")}
              className="absolute top-4 right-4 cursor-pointer bgsemi-black border border-gray-200 rounded-full p-1.5 z-10"
            >
              <Trash2 size={16} color="white" />
            </button>

            {/* BOTÓN ANTERIOR (Agregado left-4) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className={`absolute left-4 top-1/2 bg-[#2F2F2F] p-1 rounded-full -translate-y-1/2 z-50 cursor-pointer hover:scale-110 transition duration-200 ${
                index === 0 ? "hidden" : "block"
              }`}
            >
              <ChevronLeft size={30} color="#fff" />
            </button>

            {/* BOTÓN SIGUIENTE */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className={`absolute right-4 top-1/2 bg-[#2F2F2F] p-1 rounded-full -translate-y-1/2 z-50 cursor-pointer hover:scale-110 transition duration-200 ${
                index === images.length - 1 ? "hidden" : "block"
              }`}
            >
              <ChevronRight size={24} color="#fff" />
            </button>

            <div
              className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-50"
              style={{
                backgroundImage: `url(${images[index].uri})`,
              }}
            />
            <img
              className="relative z-10 max-w-full max-h-full object-contain shadow-lg"
              alt="Imagen subida"
              src={images[index].uri}
            />
          </div>
        )}

        {video && (
          <div className="flex justify-center items-center aspect-[12/2] mt-3 overflow-hidden rounded-[15px] relative group">
            <video
              src={video.uri}
              className="w-full h-full object-cover"
              controls
            />
          </div>
        )}

        {/* INPUT CONTENIDO */}
        <div className="border border-[#dbdbdb] focus-within:border-[#e5a657] focus-within:border-2 rounded-[20px] overflow-hidden flex flex-col resize-y min-h-[100px] max-h-[250px]">
          <CustomToolbar
            editor={editor}
            images={images}
            video={video}
            handleFiles={handleFiles}
          />

          <div className="flex-grow overflow-y-auto">
            <EditorContent
              editor={editor}
              className="cursor-text h-full outline-none text-[16px]"
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
            className={`flex items-center px-4 py-1.5 font-bold rounded-full text-[16px] ${
              !content || !title
                ? "cursor-not-allowed opacity-50 bg-gray text3"
                : "pointer-events-auto cursor-pointer opacity-100 bg-yellow hover:bg-[#05357e] text1"
            }`}
          >
            {withRecipe ? "Siguiente" : "Publicar"}
          </button>
        </div>
      </form>
    </section>
  );
}

/** <a
              href={images[index].uri}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              rel="noopener noreferrer"
              // Cambiamos w-full h-full por max-w-full max-h-full
              className="  max-w-full max-h-full flex"
            >
              <img
                // También cambiamos w-full h-full acá por max-w-full max-h-full
                className="relative z-10 max-w-full max-h-full object-contain cursor-pointer shadow-lg"
                alt="Imagen subida"
                src={images[index].uri}
              />
            </a> */
