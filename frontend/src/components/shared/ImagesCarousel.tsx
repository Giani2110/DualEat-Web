import type { UploadableFile } from "@/interface/global.dto";
import { pickMedia } from "@/utils/media";
import { Images, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

interface ImagesCarouselProps {
  images: UploadableFile[];
  setImages: React.Dispatch<React.SetStateAction<UploadableFile[]>>;
}

export default function ImagesCarousel({
  images,
  setImages,
}: ImagesCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const fileInputRef = useRef<any>(null);

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleAddMoreImages = (file: File[]) => {
    const newImages = pickMedia(file, "image");

    if (newImages.length === 0) {
      return;
    }

    if (images.length + newImages.length > 10) {
      console.log("No puedes subir mas de 10 imágenes");
      return;
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeFile = (index: number) => {
    // Lógica para eliminar la imagen
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (index < currentImageIndex && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
    if (newImages.length === 0) {
      // Si no quedan imágenes, ocultar el carrusel o realizar otra acción
    }
  };

  return (
    <div className="mt-6">
      <div className="w-full aspect-[6/2] overflow-hidden rounded-[20px] relative">
        {/* Fondo borroso */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-30"
          style={{
            backgroundImage: `url(${images[currentImageIndex].uri})`,
          }}
        />

        {/* Imagen principal */}
        <img
          className="w-full h-full object-contain relative z-10"
          alt={`Preview ${currentImageIndex + 1}`}
          src={images[currentImageIndex].uri}
        />

        {/* Flechas de navegación */}
        {images.length > 1 && (
          <>
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
          </>
        )}

        {/* Botón para añadir más imágenes */}
        <div className="absolute top-3 left-3 z-20">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-[40px] hover:bg-[#4A4947] bg-black/70 text-white text-[12px]"
          >
            <Images size={16} />
            Añadir
          </button>
        </div>

        {/* Input oculto para archivos adicionales */}
        <input
          aria-label="file-input"
          ref={fileInputRef}
          type="file"
          multiple={false}
          accept="image/jpeg, image/png, image/jpg, image/webp"
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              handleAddMoreImages(e.target.files ? Array.from(e.target.files) : []);
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
          {currentImageIndex + 1} / {images.length}
        </div>

        {/* Nombre del archivo */}
        <div className="absolute bottom-2 left-2 z-20 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {images[currentImageIndex]?.file.name}
        </div>

        {/* Indicadores de posición (dots) */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {images.map((_, index) => (
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
    </div>
  );
}
