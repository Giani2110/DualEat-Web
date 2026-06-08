import { getCroppedImg } from "@/utils/cropImage";
import { ArrowLeft } from "lucide-react";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";

interface ImageCropModalProps {
  imageSrc: string;
  onSave: (croppedImage: File) => void;
  onClose: () => void;
}

export const ImageCropModal = ({
  imageSrc,
  onSave,
  onClose,
}: ImageCropModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Guarda las coordenadas exactas de los píxeles recortados cuando el usuario mueve la imagen
  const onCropComplete = useCallback((croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onSave(croppedImage); // Devuelve la imagen recortada final
      }
    } catch (e) {
      toast.error("Error al recortar la imagen");
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-semi-white rounded-[20px] min-h-[70vh] md:min-h-[50vh] md:max-h-[40vh] md:max-w-[60vw] w-full overflow-hidden flex flex-col"
      >
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
            onClick={handleApply}
            className="bg-text-3 text-text-1 px-5 py-1.5 rounded-full text-xs md:text-sm font-semibold hover:bg-gray-800 transition cursor-pointer"
          >
            Aplicar
          </button>
        </div>

        {/* Contenedor del Recortador */}
        <div className="relative flex-1 bg-text-3">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Relación de aspecto (1 para cuadrado/perfil, 16/9 para banners, etc.)
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
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
      </div>
    </div>
  );
};
