import type { UploadableFile } from "@/interface/global.dto";
import { getCroppedImg } from "@/utils/cropImage";
import { ArrowLeft } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import Loader from "@/components/ui/feedback/Loader";

interface ImageCropModalProps {
  imageSrc: string;
  onSave: (croppedImage: UploadableFile) => void;
  onClose: () => void;
  isPending?: boolean;
}

export const ImageCropModal = ({
  imageSrc,
  onSave,
  onClose,
  isPending,
}: ImageCropModalProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Guarda las coordenadas exactas de los píxeles recortados cuando el usuario mueve la imagen
  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleApply = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

        const newImageFile: UploadableFile = {
          file: croppedImage,
          uri: URL.createObjectURL(croppedImage),
        };

        onSave(newImageFile);
      }
    } catch (e) {
      toast.error("Error al recortar la imagen");
    }
  };

  return (
    <>
      {/* Cabecera del Modal */}
      <div className="px-4 py-3 gap-1.5 flex flex-wrap justify-between items-center">
        <button
          onClick={onClose}
          className="hover:bg-gray-100 p-2 rounded-full transition duration-200 cursor-pointer"
        >
          <ArrowLeft color="#2F2F2F" size={20} />
        </button>
        <span className="font-bold text-text-3 text-sm md:text-base">
          Editar contenido multimedia
        </span>
        <button
          type="button"
          disabled={isPending}
          onClick={handleApply}
          className="bg-text-3 text-text-1 px-5 py-1.5 rounded-full disabled:cursor-not-allowed disabled:opacity-50 text-xs md:text-sm font-semibold hover:bg-gray-800 transition cursor-pointer"
        >
          Aplicar
        </button>
      </div>

      {/* Contenedor del Recortador */}
      <div className="relative flex-1 bg-text-3 flex items-center justify-center min-h-[300px]">
        {isReady ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Relación de aspecto (1 para cuadrado/perfil, 16/9 para banners, etc.)
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        ) : (
          <Loader color="#e5a657" size={24} />
        )}
      </div>

      {/* Barra deslizadora de Zoom */}
      <div className="p-5 flex-wrap flex flex-col items-center bg-gray-50">
        <div className="flex items-center gap-3 w-full max-w-xs justify-center">
          <span className="text-text-4 text-sm">-</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-label="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-text-4 text-sm">+</span>
        </div>
      </div>
    </>
  );
};
