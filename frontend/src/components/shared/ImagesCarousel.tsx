import type { UploadableFile } from "@/interface/global.dto";
import { getMimeType, getMimeTypeFromUrl } from "@/utils/capitalize";
import { Images, Trash2 } from "lucide-react";
import { useState } from "react";

interface ImagesCarouselProps {
  media: UploadableFile[];
  add?: () => void;
  remove?: (index: number) => void;
}

export default function ImagesCarousel({
  media,
  add,
  remove,
}: ImagesCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const nextImage = () => {
    if (currentImageIndex < media.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const currentUrl = media[currentImageIndex].uri || "";

  const mediaType =
    getMimeTypeFromUrl(currentUrl) ||
    (media[currentImageIndex].file
      ? getMimeType(media[currentImageIndex].file.type)
      : "");

  if (media.length === 0) {
    return null;
  }

  const isEdit = add !== undefined && remove !== undefined;

  return (
    <div className="w-full aspect-[6/4] md:aspect-[7/2] overflow-hidden rounded-[10px] relative">
      <div className="absolute inset-0 blur-md scale-150 brightness-30 z-0">
        {media.map((item, index) => {
          const mType =
            getMimeTypeFromUrl(item.uri || "") ||
            (item.file ? getMimeType(item.file.type) : "");
          return (
            <div
              key={item.uri}
              className={`absolute inset-0 w-full h-full ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {mType === "video" ? (
                <video
                  src={item.uri}
                  muted
                  loop
                  autoPlay={index === currentImageIndex}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : mType === "image" ? (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.uri})` }}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 w-full h-full z-10">
        {media.map((item, index) => {
          const mType =
            getMimeTypeFromUrl(item.uri || "") ||
            (item.file ? getMimeType(item.file.type) : "");
          return (
            <div
              key={item.uri}
              className={`absolute inset-0 w-full h-full ${
                index === currentImageIndex
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <a
                href={item.uri}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                {mType === "video" ? (
                  <video
                    src={item.uri}
                    controls
                    autoPlay={index === currentImageIndex}
                    muted
                    playsInline
                    className="w-full h-full object-contain relative z-10"
                  />
                ) : mType === "image" ? (
                  <img
                    className="w-full h-full object-contain relative z-10"
                    alt={`Preview ${index + 1}`}
                    src={item.uri}
                  />
                ) : (
                  <audio controls className="w-full">
                    <source src={item.uri} />
                  </audio>
                )}
              </a>
            </div>
          );
        })}
      </div>

      {/* Flechas de navegación */}
      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
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

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
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
        </>
      )}

      {/* Botón para añadir más imágenes */}
      {isEdit && mediaType !== "video" && (
        <div className="absolute top-3 left-3 z-20">
          <button
            type="button"
            onClick={() => add()}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-[40px] hover:bg-[#4A4947] bg-black/70 text-white text-[12px]"
          >
            <Images size={16} />
            Añadir
          </button>
        </div>
      )}

      {/* Botón para eliminar imagen actual */}
      {isEdit && (
        <button
          type="button"
          onClick={() => {
            remove?.(currentImageIndex);

            if (currentImageIndex > 0) {
              setCurrentImageIndex(currentImageIndex - 1);
            }
          }}
          className="absolute top-3 right-3 z-20 w-9 h-9 cursor-pointer hover:bg-[#4A4947] bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200"
          title="Eliminar imagen"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* Contador de imágenes */}
      <div className="absolute bottom-2 right-2 z-20 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
        {currentImageIndex + 1} / {media.length}
      </div>

      {/* Indicadores de posición (dots) */}
      {media.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {media.map((_, index) => (
            <button
              title="Indicador de posición"
              key={index}
              type="button"
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
