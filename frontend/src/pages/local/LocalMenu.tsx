import { useState, useMemo, useRef, useEffect, useContext } from 'react';
import { PlusCircle, Edit, Trash2, Tag, Sun, TrendingUp, Search, Upload, FilePlus, ChevronLeft, ChevronRight, CameraOff, TrendingDown, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import '../../assets/scss/users/users.scss';
import EditFoodModal from '../../components/locals/EditFoodModal';

// Definición de las interfaces
interface Food {
  id: number;
  local_id: number;
  category_id: number;
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

interface StatPillProps {
  text: string;
  color: string;
  icon?: LucideIcon;
}

const StatPill = ({ text, color, icon: Icon }: StatPillProps) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${color}`}>
    {Icon && <Icon className="w-3 h-3" />}
    <span>{text}</span>
  </span>
);

const LocalMenu = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [foods, setFoods] = useState<Food[]>([]);
  const [localId, setLocalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [foodToHide, setFoodToHide] = useState<Food | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  
  const categoriesRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const exampleCategories: Category[] = useMemo(() => ([
    { id: 1, name: 'Entradas', icon_url: 'https://cdn-icons-png.flaticon.com/512/3595/3595878.png' },
    { id: 2, name: 'Platos Principales', icon_url: 'https://cdn-icons-png.flaticon.com/512/414/414972.png' },
    { id: 3, name: 'Bebidas', icon_url: 'https://cdn-icons-png.flaticon.com/512/2633/2633894.png' },
    { id: 4, name: 'Postres', icon_url: 'https://cdn-icons-png.flaticon.com/512/3233/3233800.png' },
    { id: 5, name: 'Promociones', icon_url: 'https://cdn-icons-png.flaticon.com/512/10041/10041183.png' },
    { id: 6, name: 'Menú del día', icon_url: 'https://cdn-icons-png.flaticon.com/512/815/815599.png' },
    { id: 7, name: 'Pastas', icon_url: 'https://cdn-icons-png.flaticon.com/512/5772/5772274.png' },
    { id: 8, name: 'Carnes', icon_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063283.png' },
    { id: 9, name: 'Sopas y Cremas', icon_url: 'https://cdn-icons-png.flaticon.com/512/219/219816.png' },
    { id: 10, name: 'Pescados y Mariscos', icon_url: 'https://cdn-icons-png.flaticon.com/512/10074/10074697.png' },
    { id: 11, name: 'Opciones Veganas', icon_url: 'https://cdn-icons-png.flaticon.com/512/2694/2694726.png' },
    { id: 12, name: 'Desayunos', icon_url: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  ]), []);

  useEffect(() => {
    const fetchUserLocal = async () => {
      if (!user) {
        setLoading(false);
        setError('Usuario no autenticado');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/users/${user.id}/local`);
        if (!res.ok) {
          throw new Error('No se pudo obtener el local para este usuario.');
        }
        const data = await res.json();
        if (data?.id) {
          setLocalId(data.id);
        } else {
          setError('No se encontró un local asociado a este usuario.');
        }
      } catch (err) {
        console.error(err);
        setError('Error al obtener el local del usuario.');
        setLoading(false);
      }
    };
    fetchUserLocal();
  }, [user, API_BASE]);

  useEffect(() => {
    const fetchFoods = async () => {
      if (!localId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/food/local/${localId}/foods`);
        if (!response.ok) {
          throw new Error('Error al cargar los platos del menú.');
        }
        const data = await response.json();
        setFoods(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el menú. Intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, [localId, API_BASE]);
  
  useEffect(() => {
    if (isModalOpen || isConfirmModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isConfirmModalOpen]);

  // Función para "ocultar" un plato, marcándolo como no disponible
  const handleHideFood = async () => {
    if (!foodToHide) return;

    try {
      const response = await fetch(`${API_BASE}/food/foods/${foodToHide.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: false }),
      });
      if (!response.ok) {
        throw new Error('Error al eliminar el plato.');
      }
      const updatedFood = await response.json();
      setFoods(prevFoods =>
        prevFoods.map(f => (f.id === updatedFood.id ? updatedFood : f))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirmModalOpen(false);
      setFoodToHide(null);
    }
  };

  const handleUpdateFood = (food: Food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  const handleOnSave = (updatedFood: Food) => {
    setFoods(prevFoods =>
      prevFoods.map(f => (f.id === updatedFood.id ? updatedFood : f))
    );
  };

  const filteredFoods = useMemo(() => {
    return foods.filter(food =>
      food.available && // <-- Filtrar solo los platos disponibles
      (selectedCategory === null || food.category_id === selectedCategory) &&
      (food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [selectedCategory, searchTerm, foods]);

  const currentCategoryName = useMemo(() => {
    return selectedCategory
      ? exampleCategories.find(cat => cat.id === selectedCategory)?.name
      : 'Todos los Platos';
  }, [selectedCategory, exampleCategories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 300;
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const checkScrollable = () => {
      if (categoriesRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = categoriesRef.current;
        setShowArrows(scrollWidth > clientWidth);
        setIsAtStart(scrollLeft <= 1);
        setIsAtEnd(scrollLeft >= scrollWidth - clientWidth - 1);
      }
    };

    const currentRef = categoriesRef.current;
    if (currentRef) {
      checkScrollable();
      currentRef.addEventListener('scroll', checkScrollable);
      
      const resizeObserver = new ResizeObserver(checkScrollable);
      resizeObserver.observe(currentRef);
      
      return () => {
        currentRef.removeEventListener('scroll', checkScrollable);
        resizeObserver.disconnect();
      };
    }
  }, [exampleCategories]);

  return (
    <>
      <div className="bgFood2 min-h-screen text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestión de Menú</h1>
              <p className="text-gray-400">
                Crea, edita y organiza los platos de tu restaurante.
              </p>
            </div>
          </header>
          
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center border border-gray-700 hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                onClick={() => alert('Función para agregar plato manualmente')}
              >
                <FilePlus className="w-12 h-12 text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-white">Agregar Plato</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Crea un plato nuevo y personalízalo.
                </p>
              </div>
              <div 
                className="bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center border border-gray-700 hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                onClick={() => alert('Función para subir imagen')}
              >
                <Upload className="w-12 h-12 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white">Subir con Foto</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Sube una imagen de un menú para extraer los datos.
                </p>
              </div>
              <div 
                className="bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center border border-gray-700 hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                onClick={() => alert("Función para crear una nueva categoría")}
              >
                <PlusCircle className="w-12 h-12 text-green-400 mb-3" />
                <h3 className="text-lg font-semibold text-white">Nueva Categoría</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Agrega una nueva sección para tus platos.
                </p>
              </div>
            </div>
          </section>

          <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 mb-8">
            <div className="relative w-full mb-6">
              <input
                type="text"
                placeholder="Buscar platos o descripciones..."
                className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e5a657] transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <div className="relative">
              {showArrows && !isAtStart && (
                <button
                  onClick={() => scrollCategories('left')}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 bg-gray-900/90 hover:bg-gray-900 p-2 rounded-full shadow-lg z-20 transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <div className="relative overflow-hidden">
                {showArrows && !isAtStart && (
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-800 to-transparent z-10 pointer-events-none" />
                )}
                {showArrows && !isAtEnd && (
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-800 to-transparent z-10 pointer-events-none" />
                )}
                <div
                  ref={categoriesRef}
                  className="overflow-x-auto scrollbar-hide px-3"
                  style={{ 
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <div className="flex space-x-3 py-2">
                    <button
                      className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-200 whitespace-nowrap text-sm font-medium ${
                        selectedCategory === null 
                          ? 'bg-[#e5a657] text-white shadow-lg' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <Tag className="w-4 h-4" />
                      <span>Todos</span>
                    </button>
                    {exampleCategories.map(category => (
                      <button
                        key={category.id}
                        className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-200 whitespace-nowrap text-sm font-medium ${
                          selectedCategory === category.id 
                            ? 'bg-[#e5a657] text-white shadow-lg' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <img 
                          src={category.icon_url} 
                          alt={category.name} 
                          className="w-4 h-4"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {showArrows && !isAtEnd && (
                <button
                  onClick={() => scrollCategories('right')}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 bg-gray-900/90 hover:bg-gray-900 p-2 rounded-full shadow-lg z-20 transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>

          <section className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">{currentCategoryName}</h3>
            {loading ? (
              <div className="text-center text-gray-400 p-8">Cargando platos... 🍽️</div>
            ) : error ? (
              <div className="text-center text-red-400 p-8">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredFoods.length > 0 ? (
                  filteredFoods.map(food => (
                    <div key={food.id} className="bg-gray-700 rounded-xl shadow-lg overflow-hidden flex flex-col hover:scale-105 transition-transform duration-300 relative group border border-gray-600">
                      <div className="relative">
                        {food.image_url ? (
                          <img src={food.image_url} alt={food.name} className="w-full h-32 md:h-36 object-cover" />
                        ) : (
                          <div className="w-full h-32 md:h-36 bg-gray-600 flex flex-col items-center justify-center text-center text-gray-300 p-4">
                            <CameraOff className="w-8 h-8 mb-2" />
                            <p className="text-sm font-semibold">Recomendable</p>
                            <p className="text-xs">Cargar Foto</p>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex space-x-2 transition-opacity">
                          <button
                            className="bg-gray-900/70 backdrop-blur-sm p-2 rounded-full text-blue-400 hover:text-blue-200 transition-colors"
                            onClick={() => handleUpdateFood(food)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-gray-900/70 backdrop-blur-sm p-2 rounded-full text-red-400 hover:text-red-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFoodToHide(food);
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h5 className="font-semibold text-white text-sm md:text-base mb-1 line-clamp-2">{food.name}</h5>
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{food.description}</p>
                        </div>
                        <div className="mt-auto">
                          <span className="font-bold text-lg md:text-xl text-green-400 block mb-2">${(food.price || 0).toLocaleString('es-AR')}</span>
                          <div className="flex flex-wrap gap-1">
                            <StatPill text={`${food.votes_up || 0} Likes`} color="bg-green-500/20 text-green-400" icon={TrendingUp} />
                            <StatPill text={`${food.votes_down || 0} Dislikes`} color="bg-red-500/20 text-red-400" icon={TrendingDown} />
                            <StatPill text={food.available ? "Disponible" : "No disponible"} color={food.available ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"} icon={Sun} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 p-8">
                    <p>No se encontraron platos que coincidan con la búsqueda en esta categoría.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
      
      {isModalOpen && (
        <EditFoodModal
          food={selectedFood}
          categories={exampleCategories}
          onClose={() => setIsModalOpen(false)}
          onSave={handleOnSave}
        />
      )}

{isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop con desenfoque */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsConfirmModalOpen(false)}
          />

          {/* Contenedor del Modal */}
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-gray-700/50 animate-modal-in">
            {/* Elementos decorativos */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#B53325] to-[#d94a36]" />
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#B53325]/10 rounded-full blur-3xl" />

            {/* Encabezado */}
            <div className="relative flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-[#B53325] to-[#d94a36] rounded-xl">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Confirmar Eliminación
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="group p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 text-center">
              <p className="text-gray-300 mb-6">
                ¿Estás seguro de que quieres ELIMINAR este plato?
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-6 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 hover:text-white rounded-xl transition-all duration-200 font-semibold border border-gray-600/30 hover:border-gray-500/50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleHideFood}
                  className="group relative overflow-hidden px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Trash2 className="w-5 h-5" />
                    <span>Confirmar Eliminación</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default LocalMenu;