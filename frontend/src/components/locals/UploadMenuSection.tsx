import { useState } from 'react';
import { Camera, Download } from 'lucide-react';
import TutorialModal from './TutorialModal';

interface UploadMenuSectionProps {
  localId: number;
  onSuccess: () => void;
  onDishesExtracted: (dishes: any[]) => void; // Para la fase de revisión
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const UploadMenuSection = ({ localId, onSuccess, onDishesExtracted }: UploadMenuSectionProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona una imagen primero.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('menuImage', file);

    try {
      const response = await fetch(`${API_BASE}/local/${localId}/menu-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar la imagen del menú.');
      }

      const result = await response.json();
      onDishesExtracted(result.dishes);
      onSuccess();

    } catch (err: any) {
      setError(`Error al subir: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl space-y-4">
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <h3 className="text-xl font-bold text-white flex items-center space-x-2">
        <Camera className="w-6 h-6 text-[#B53325]" />
        <span>Subir Menú con OCR</span>
      </h3>
      <p className="text-gray-400 text-sm">
        Sube una foto de tu menú y la procesaremos automáticamente para detectar los platos y precios.
      </p>

      {/* Botón para abrir el tutorial */}
      <button
        type="button"
        onClick={() => setIsTutorialOpen(true)}
        className="text-[#B53325] hover:text-[#d94a36] font-semibold text-sm transition-colors"
      >
        Ver Guía para Mejores Resultados
      </button>

      {/* Área de carga */}
      <div className="flex flex-col items-center justify-center p-6 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600">
        <input
          type="file"
          id="menuImage"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <label htmlFor="menuImage" className="cursor-pointer text-center space-y-2">
          <Download className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-gray-300 font-medium">Arrastra y suelta aquí o <span className="text-[#B53325]">haz clic para subir</span></p>
          <p className="text-xs text-gray-500">Solo imágenes (JPEG, PNG, etc.)</p>
        </label>
        {file && (
          <p className="mt-2 text-sm text-gray-300">Archivo seleccionado: <span className="font-semibold">{file.name}</span></p>
        )}
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full py-3 bg-[#B53325] text-white font-semibold rounded-lg transition-colors hover:bg-[#d94a36] disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : 'Subir y Procesar Menú'}
      </button>
    </div>
  );
};

export default UploadMenuSection;