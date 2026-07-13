import type { UploadableFile } from "@/interface/global.dto";
import { getMimeType, getMimeTypeFromUrl } from "@/utils/capitalize";
import { ChevronLeft, ChevronRight, Images, Trash2 } from "lucide-react";
import { useState } from "react";

import { motion } from "framer-motion";

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
      {/* BACKGROUND DE LA IMAGEN */}
      <div className="absolute inset-0 blur-md scale-150 brightness-30 z-0 overflow-hidden">
        <motion.div
          className="flex flex-row w-full h-full"
          animate={{ x: `-${currentImageIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        >
          {media.map((item, index) => {
            const mType =
              getMimeTypeFromUrl(item.uri || "") ||
              (item.file ? getMimeType(item.file.type) : "");

            return (
              <div key={item.uri} className="w-full h-full flex-shrink-0">
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
        </motion.div>
      </div>

      {/* Foreground slide container */}
      <div className="absolute inset-0 w-full h-full z-10 overflow-hidden">
        <motion.div
          className="flex flex-row w-full h-full"
          animate={{ x: `-${currentImageIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        >
          {media.map((item, index) => {
            const mType =
              getMimeTypeFromUrl(item.uri || "") ||
              (item.file ? getMimeType(item.file.type) : "");

            return (
              <div
                key={item.uri}
                className="w-full h-full flex-shrink-0 relative"
              >
                <a
                  href={item.uri}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  onDragStart={(e) => e.preventDefault()}
                  draggable={false}
                  rel="noopener noreferrer"
                  className="block w-full h-full select-none"
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
                      className="w-full h-full object-contain relative z-10 select-none"
                      alt={`Preview ${index + 1}`}
                      src={item.uri}
                      draggable={false}
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
        </motion.div>
      </div>

      {/* Flechas de navegación */}
      {media.length > 1 && (
        <div className="w-full h-full flex flex-row justify-between items-center px-8 *:z-20">
          <button
            type="button"
            disabled={currentImageIndex === 0}
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="cursor-pointer p-1 bg-black/70 hover:bg-black/30 rounded-full transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Imagen anterior"
          >
            <ChevronLeft color="#fff" />
          </button>

          <button
            type="button"
            disabled={currentImageIndex === media.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="cursor-pointer p-1 bg-black/70 hover:bg-black/30 rounded-full transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Siguiente imagen"
          >
            <ChevronRight color="#fff" />
          </button>
        </div>
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
