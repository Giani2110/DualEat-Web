import { useState, useRef, useEffect } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Plus, Minus } from "lucide-react";

interface RCropProps {
  src: string;
  onComplete: (url: string) => void;
  onCancel: () => void;
  type: string;
}

export default function RCrop({ src, onComplete, onCancel, type }: RCropProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 50,
    y: 50,
    width: 300,
    height: 200,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Función para ajustar el crop inicial cuando la imagen se carga
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    // Establecer un crop inicial que cubra la mayor parte de la imagen
    const initialCrop: Crop = {
      unit: "px",
      x: 0,
      y: height * 0.4,
      width: width * 1,
      height: height * 0.2,
    };

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
    setImageLoaded(true);
  };

  const getContainerStyle = () => {
    if (!imageLoaded) return { height: "500px" };

    const maxHeight = 400;

    return {
      maxWidth: "100%",
      maxHeight: `${maxHeight}px`,
      aspectRatio: "auto",
    };
  };

  const getImageStyle = () => {
    const baseMaxHeight = 400;
    return {
      maxHeight: `${baseMaxHeight * zoom}px`,
      width: "auto",
      height: "auto",
      transform: `scale(1)`,
      transformOrigin: "center center",
    };
  };

  // Funciones de zoom
  const handleZoomIn = () => {
    if (zoom < 2) {
      setZoom((prev) => Math.min(prev + 0.2, 2));
    }
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) {
      setZoom((prev) => Math.max(prev - 0.2, 0.5));
    }
  };

  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Usar las dimensiones reales del crop para mantener la calidad
    const cropWidth = crop.width! * scaleX;
    const cropHeight = crop.height! * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x! * scaleX,
      crop.y! * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
  }, [completedCrop]);

  const handleConfirm = () => {
    if (!previewCanvasRef.current) return;

    previewCanvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        onComplete(url);
      },
      "image/jpeg",
      1.0
    );
  };

  return (
    <>
      <p className="text-[13px] text6 tracking-tight mt-1 mb-10">
        {type === "banner" ? (
          <>Para una mayor calidad, se recomienda usar imágenes horizontales. Los banners deben tener una de 1028 px x 128 px</>
        ) : (
          <>Para una mayor calidad, se recomienda usar imágenes donde el ícono tenga una proporción de 1:1</>
        )}
      </p>
      <div className="w-full max-w-[730px] mx-auto">
        <div
          className="relative w-full h-[400px] bg-black rounded-lg overflow-auto flex items-center justify-center"
          style={getContainerStyle()}
        >
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            keepSelection
            className="max-w-full"
          >
            <img
              ref={imgRef}
              src={src}
              alt="crop"
              onLoad={onImageLoad}
              className="max-w-full object-contain"
              style={getImageStyle()}
            />
          </ReactCrop>
        </div>

        {/* Controles principales */}
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <button
              title="Zoom Out"
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="w-8 h-8 flex cursor-pointer items-center justify-center bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-[5px] text-sm font-bold"
            >
              <Minus size={16} />
            </button>

            <button
              title="Zoom In"
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="w-8 h-8 flex cursor-pointer items-center justify-center bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-[5px] text-sm font-bold"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="gap-2 flex">
            <button
              onClick={onCancel}
              type="button"
              className="text-[12px] text3 tracking-tight bg-gray px-4 py-2 rounded-[40px] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!imageLoaded}
              onClick={handleConfirm}
              className={`text-[12px] text1 tracking-tight bg-yellow px-4 py-2 rounded-[40px] ${
                !imageLoaded
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              Guardar
            </button>
          </div>
        </div>
        <canvas ref={previewCanvasRef} className="hidden" />
      </div>
    </>
  );
}
