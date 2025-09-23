import { useState, useEffect } from 'react';
import { X, Upload, MinusCircle, Camera, Star, Sparkles } from 'lucide-react';

interface Food {
  id: number;
  local_id: number;
  category_id: number;
  local_menu_category_id?: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  available: boolean;
  votes_up?: number;
  votes_down?: number;
}

interface Category {
  id: number;
  name: string;
  icon_url: string;
}

interface EditFoodModalProps {
  food: Food | null;
  categories: Category[];
  onClose: () => void;
  onSave: (updatedFood: Food) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const EditFoodModal = ({ food, categories, onClose, onSave }: EditFoodModalProps) => {
  const isNewFood = !food || food.id === 0;

  const [formData, setFormData] = useState<Partial<Food> | null>(food);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setFormData(food);
  }, [food]);

  if (!food || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let typedValue: string | number | null = value;
    if (name === 'price') {
      typedValue = parseFloat(value);
      if (isNaN(typedValue)) typedValue = 0;
    }
    
    // Actualizar para manejar category_id como local_menu_category_id
    if (name === 'category_id') {
      const categoryId = parseInt(value, 10);
      if (isNaN(categoryId)) {
        setFormData(prev => ({
          ...prev,
          category_id: 0,
          local_menu_category_id: undefined
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          category_id: 0, // Limpiar category_id
          local_menu_category_id: categoryId
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: typedValue
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      setLoading(true);
      setError(null);
  
      const formData = new FormData();
      formData.append('image', file);
  
      const response = await fetch(`${API_BASE}/food/upload-image`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen al servidor.');
      }
  
      const { url } = await response.json();
  
      setFormData(prev => ({ ...prev, image_url: url }));
  
    } catch (err: any) {
      console.error('Error al subir la imagen:', err);
      setError(`No se pudo subir la imagen: ${err.message || 'Error de red.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const dummyImageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image_url: dummyImageUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData?.name || !formData.price || !formData.local_menu_category_id) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }
  
    onSave(formData as Food);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop con desenfoque */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-gray-700/50 animate-modal-in">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#B53325] to-[#d94a36]" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#B53325]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#d94a36]/10 rounded-full blur-3xl" />

        {/* Encabezado */}
        <div className="relative flex items-center justify-between p-8 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-[#B53325] to-[#d94a36] rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {isNewFood ? 'Agregar Plato' : 'Editar Plato'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isNewFood ? 'Crea un nuevo plato para tu menú' : 'Personaliza tu deliciosa creación'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Sección de carga de imagen */}
            <div className="text-center space-y-6">
              <div
                className={`relative mx-auto w-64 h-64 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group ${
                  dragActive
                    ? 'border-[#B53325] bg-[#B53325]/10 scale-105'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.image_url ? (
                  <>
                    <img
                      src={formData.image_url}
                      alt="Previsualización del plato"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-2xl">
                      <Upload className="w-12 h-12" />
                    </div>
                    <div className="text-center px-4">
                      <p className="font-semibold text-lg">Sube una foto increíble</p>
                      <p className="text-sm text-gray-500">Arrastra aquí o haz click para seleccionar</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center space-x-4">
                <label className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-[#B53325] to-[#d94a36] hover:from-[#d94a36] hover:to-[#B53325] text-white font-semibold rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>{formData.image_url ? 'Cambiar Foto' : 'Subir Foto'}</span>
                  </div>
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </label>

                {formData.image_url && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: null }))}
                    className="group px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 border border-red-500/30 hover:border-red-400/50"
                  >
                    <div className="flex items-center space-x-2">
                      <MinusCircle className="w-5 h-5" />
                      <span>Quitar</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Campos del formulario */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Columna Izquierda */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-300 flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Nombre del Plato</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#B53325]/50 focus:border-[#B53325]/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Ej: Pizza Margarita Suprema"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-semibold text-gray-300">
                    Precio ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold text-lg">$</span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleChange}
                      required
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 backdrop-blur-sm"
                      placeholder="4500.50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="category_id" className="block text-sm font-semibold text-gray-300">
                    Categoría
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.local_menu_category_id || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#B53325]/50 focus:border-[#B53325]/50 transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-300">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#B53325]/50 focus:border-[#B53325]/50 transition-all duration-200 backdrop-blur-sm resize-none"
                    placeholder="Describe tu plato de manera apetitosa y detallada. ¡Haz que los clientes se emocionen!"
                  ></textarea>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-700/50">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 hover:text-white rounded-xl transition-all duration-200 font-semibold border border-gray-600/30 hover:border-gray-500/50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-[#B53325] to-[#d94a36] hover:from-[#d94a36] hover:to-[#B53325] text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>{isNewFood ? 'Agregar Plato' : 'Guardar Cambios'}</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-modal-in {
          animation: modal-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(181, 51, 37, 0.5) rgba(55, 65, 81, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(181, 51, 37, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(181, 51, 37, 0.7);
        }
      `}</style>
    </div>
  );
};

export default EditFoodModal;