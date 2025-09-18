import { X, CheckCircle, Lightbulb } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-xl p-8 shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Lightbulb size={40} className="text-yellow-500" />
            <h2 className="text-3xl font-bold text-white">Consejos para una Mejor Detección</h2>
          </div>
          <p className="text-gray-300">
            Para que nuestro sistema de inteligencia artificial pueda leer tu menú correctamente, la foto debe seguir estos consejos.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white">Formato Ideal</h3>
                <p className="text-gray-400 mt-1">
                  El formato más efectivo es el clásico **Alimento ................... Precio**. Esto nos ayuda a identificar fácilmente la relación entre el nombre del plato y su valor.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white">Foto Clara y Centrada</h3>
                <p className="text-gray-400 mt-1">
                  Asegúrate de que la foto no esté borrosa, que tenga buena iluminación y que el menú esté bien centrado en el encuadre. Evita sombras y reflejos.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <X size={24} className="text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white">Evita Formatos Complejos</h3>
                <p className="text-gray-400 mt-1">
                  Menús con descripciones muy largas o diseños creativos (por ejemplo, precios lejos de los nombres) pueden confundir al sistema.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#B53325] text-white font-semibold rounded-lg hover:bg-[#d94a36] transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;