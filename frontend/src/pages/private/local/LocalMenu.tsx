/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { PlusCircle, Edit, Trash2, Tag, TrendingUp, Search, Upload, FilePlus, ChevronLeft, ChevronRight, CameraOff, TrendingDown, X, Sparkles, AlertTriangle, Check, HelpCircle, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AuthContext } from '@/context/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import '@assets/scss/private/users/users.scss';
import EditFoodModal from "../../../components/private/locals/EditFoodModal"
import UploadMenuSection from "../../../components/private/locals/UploadMenuSection"
import React from 'react';

// ----------------------------------------------------------------------
// Interfaces de Datos
// ----------------------------------------------------------------------
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
  local_id: number;
}

interface PredefinedCategory {
  id: number;
  name: string;
  icon_url: string;
}

interface StatPillProps {
  text: string;
  color: string;
  icon?: LucideIcon;
}

// ----------------------------------------------------------------------
// Interfaces y Definición del Tour Manual
// ----------------------------------------------------------------------
interface Bounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourStep {
  id: number;
  title: string;
  text: string;
  selector: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "Bienvenido a la Gestión de Menú",
    text: "Aquí puede administrar, crear y organizar todos los platos de su local. El menú es el corazón de su negocio.",
    selector: "#help-button",
    placement: "left",
  },
  {
    id: 2,
    title: "Creación y Carga",
    text: "Estas tarjetas permiten las tres acciones principales: crear platos manualmente, subir una foto para escanear el menú (OCR) o añadir una nueva categoría.",
    selector: "#creation-quick-links",
    placement: "bottom",
  },
  {
    id: 3,
    title: "Búsqueda Rápida",
    text: "Use esta barra para buscar cualquier plato o descripción, incluso a través de categorías.",
    selector: "#search-bar-container",
    placement: "bottom",
  },
  {
    id: 4,
    title: "Filtro de Categorías",
    text: "Filtre su menú haciendo clic en las categorías. Si la lista es larga, puede usar las flechas laterales para desplazarse.",
    selector: "#categories-filter",
    placement: "bottom",
  },
  {
    id: 5,
    title: "Lista de Platos",
    text: "Esta es la lista principal de su menú. Cada plato muestra su precio y votos. Puede editar o eliminar un plato haciendo clic en el botón de acciones.",
    selector: "#menu-items-section",
    placement: "top",
  },
];
// ----------------------------------------------------------------------


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
  const [showOcrModal, setShowOcrModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);

  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [predefinedCategories, setPredefinedCategories] = useState<PredefinedCategory[]>([]);
  const [selectedPredefinedCategory, setSelectedPredefinedCategory] = useState<string>('');
  const [extractedDishes, setExtractedDishes] = useState<any[]>([]);

  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);

  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(null);

  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const navigate = useNavigate();

  // ----------------------------------------------------------------------
  // Estados y Lógica del Tour Manual
  // ----------------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(0);
  const isTourOpen = currentStep > 0;

  const startTour = () => setCurrentStep(1);
  const closeTour = () => setCurrentStep(0);
  const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, TOUR_STEPS.length));
  const goToPrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const activeStep = TOUR_STEPS.find(step => step.id === currentStep);
  // ----------------------------------------------------------------------


  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    const checkSub = async () => {
      if (!localId) return;
      try {
        const response = await fetch(`${API_BASE}/subscriptions/local/${localId}`);
        if (response.ok) {
          const data = await response.json();
          setHasActiveSubscription(data?.status === 'active');
        } else {
          setHasActiveSubscription(false);
        }
      } catch (e) {
        setHasActiveSubscription(false);
      }
    };
    checkSub();
  }, [localId, API_BASE]);

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
    const fetchLocalCategories = async () => {
      if (!localId) return;
      try {
        const response = await fetch(`${API_BASE}/local-menu-categories/local/${localId}`);
        if (!response.ok) {
          throw new Error('Error al cargar las categorías del local.');
        }
        const data = await response.json();
        setLocalCategories(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar las categorías. Intente de nuevo.');
      }
    };
    fetchLocalCategories();
  }, [localId, API_BASE]);

  useEffect(() => {
    const fetchPredefinedCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/admin/food-categories`);
        if (!response.ok) {
          throw new Error('Error al cargar las categorías preestablecidas.');
        }
        const data = await response.json();
        setPredefinedCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPredefinedCategories();
  }, [API_BASE]);

  useEffect(() => {
    if (isModalOpen || isConfirmModalOpen || showOcrModal || showCreateCategoryModal || showDeleteCategoryModal || isTourOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isConfirmModalOpen, showOcrModal, showCreateCategoryModal, showDeleteCategoryModal, isTourOpen]);

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

  const handleAddFood = () => {
    if (!localId) {
      alert('Error: No se encontró el ID del local.');
      return;
    }

    setSelectedFood({
      id: 0,
      local_id: localId,
      category_id: 0,
      local_menu_category_id: selectedCategory || undefined,
      name: '',
      price: 0,
      description: '',
      image_url: null,
      available: true,
      votes_up: 0,
      votes_down: 0,
    });
    setIsModalOpen(true);
  };

  const handleUpdateFood = (food: Food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  const handleOnSave = async (food: Food) => {
    const isNewFood = food.id === 0;

    const foodData = {
      ...food,
      // Si tiene local_menu_category_id, no enviar category_id
      category_id: food.local_menu_category_id ? undefined : food.category_id,
      local_menu_category_id: food.local_menu_category_id
    };

    try {
      const method = isNewFood ? 'POST' : 'PUT';
      const url = isNewFood
        ? `${API_BASE}/locals/${food.local_id}/manual-menu`
        : `${API_BASE}/food/foods/${food.id}`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodData),
      });

      if (!response.ok) {
        throw new Error(`Error al ${isNewFood ? 'agregar' : 'actualizar'} el plato.`);
      }

      const savedFood = await response.json();
      setFoods(prevFoods => {
        if (isNewFood) {
          return [...prevFoods, savedFood];
        }
        return prevFoods.map(f => (f.id === savedFood.id ? savedFood : f));
      });

      if (food.id && food.id.toString().startsWith('temp-')) {
        setExtractedDishes(prevDishes => prevDishes.filter(dish => dish.id !== food.id));
      }

    } catch (err) {
      console.error('Error al guardar el plato:', err);
      if (err instanceof Error) {
        alert(`Hubo un error al guardar el plato: ${err.message}.`);
      } else {
        alert('Hubo un error al guardar el plato.');
      }
    } finally {
      setIsModalOpen(false);
      setSelectedFood(null);
    }
  };

  const handleExtractedDishes = (dishes: any[]) => {
    if (dishes.length === 0) {
      alert('No se encontraron platos extraídos.');
    }
    setExtractedDishes(dishes);
    setShowOcrModal(false);
  };

  const handleSaveAllExtractedDishes = async () => {
    if (!localId) {
      alert('Error: ID del local no encontrado.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/locals/${localId}/manual-menu/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dishes: extractedDishes }),
      });
      if (!response.ok) {
        throw new Error('Error al guardar los platos extraídos.');
      }

      const savedDishes = await response.json();
      setFoods([...foods, ...savedDishes.data]);
      setExtractedDishes([]);
    } catch (error: any) {
      console.error("Error al guardar los platos extraídos:", error);
      setError(error.message);
    }
  };

  const handleEditExtractedDish = (dish: any) => {
    setSelectedFood({
      id: dish.id || 0,
      local_id: localId!,
      category_id: dish.category_id || 0,
      name: dish.name,
      price: dish.price,
      description: dish.description || null,
      image_url: dish.image_url || null,
      available: true,
      votes_up: dish.votes_up || 0,
      votes_down: dish.votes_down || 0,
    });
    setIsModalOpen(true);
  };

  const handleCreateLocalCategory = async () => {
    if (!localId) {
      setError('Error: No se pudo determinar el local para crear la categoría.');
      setShowCreateCategoryModal(false);
      return;
    }

    let categoryNameToCreate: string;
    let iconUrl: string | null = null;

    if (selectedPredefinedCategory) {
      const selectedCat = predefinedCategories.find(cat => cat.id.toString() === selectedPredefinedCategory);
      if (!selectedCat) {
        setNewCategoryError('Categoría preestablecida no encontrada.');
        return;
      }
      categoryNameToCreate = selectedCat.name;
      iconUrl = selectedCat.icon_url;
    } else if (newCategoryName.trim() !== '') {
      categoryNameToCreate = newCategoryName.trim();
    } else {
      setNewCategoryError('Debe seleccionar una categoría o ingresar un nombre.');
      return;
    }

    const isDuplicate = localCategories.some(cat => cat.name.toLowerCase() === categoryNameToCreate.toLowerCase());
    if (isDuplicate) {
      setNewCategoryError('Ya existe una categoría con ese nombre.');
      return;
    }

    setNewCategoryError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/local-menu-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryNameToCreate,
          local_id: localId,
          icon_url: iconUrl,
        }),
      });
      if (!response.ok) {
        throw new Error('Error al crear la categoría.');
      }
      const createdCategory = await response.json();
      setLocalCategories(prevCategories => [...prevCategories, createdCategory]);
      setNewCategoryName('');
      setSelectedPredefinedCategory('');
      setShowCreateCategoryModal(false);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setNewCategoryError('Hubo un error al crear la categoría. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };


  const confirmDeleteCategory = async () => {
    if (!categoryToDeleteId) return;
    try {
      const response = await fetch(`${API_BASE}/local-menu-categories/${categoryToDeleteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar la categoría.');
      }

      setLocalCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryToDeleteId));

      setFoods(prevFoods =>
        prevFoods.map(food => {
          if (food.local_menu_category_id === categoryToDeleteId) {
            return { ...food, local_menu_category_id: undefined };
          }
          return food;
        })
      );

      if (selectedCategory === categoryToDeleteId) {
        setSelectedCategory(null);
      }

      setShowDeleteCategoryModal(false);
      setCategoryToDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openDeleteCategoryModal = (categoryId: number) => {
    setCategoryToDeleteId(categoryId);
    setShowDeleteCategoryModal(true);
  };

  const filteredFoods = useMemo(() => {
    return foods.filter(food =>
      food.available &&
      (selectedCategory === null ||
        food.category_id === selectedCategory ||
        food.local_menu_category_id === selectedCategory) &&
      (food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [selectedCategory, searchTerm, foods]);

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
  }, [localCategories]);


  // ----------------------------------------------------------------------
  // Componente Modal Flotante del Tour
  // ----------------------------------------------------------------------
  const TourModal = () => {
    const [bounds, setBounds] = useState<Bounds | null>(null);
    const [isPositioned, setIsPositioned] = useState(false);
    const modalRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!activeStep) return;

      const element = document.querySelector(activeStep.selector) as HTMLElement;
      if (!element) return;

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const updateBoundsAndPosition = () => {
        const rect = element.getBoundingClientRect();

        const padding = 10;

        setBounds({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + 2 * padding,
          height: rect.height + 2 * padding,
        });

        if (modalRef.current) {
          let modalStyle: React.CSSProperties = { top: 0, left: 0 };

          const OFFSET_DISTANCE = 25;
          const MODAL_WIDTH = 320;
          const MODAL_HEIGHT = 180;

          switch (activeStep.placement) {
            case 'right':
              modalStyle.top = rect.top + (rect.height / 2) - (MODAL_HEIGHT / 2);
              modalStyle.left = rect.left + rect.width + OFFSET_DISTANCE;
              break;
            case 'left':
              modalStyle.top = rect.top + (rect.height / 2) - (MODAL_HEIGHT / 2);
              modalStyle.left = rect.left - MODAL_WIDTH - OFFSET_DISTANCE;
              break;
            case 'top':
              modalStyle.left = rect.left + (rect.width / 2) - (MODAL_WIDTH / 2);
              modalStyle.top = rect.top - MODAL_HEIGHT - OFFSET_DISTANCE;
              break;
            case 'bottom':
              modalStyle.left = rect.left + (rect.width / 2) - (MODAL_WIDTH / 2);
              modalStyle.top = rect.top + rect.height + OFFSET_DISTANCE;
              break;
          }

          // Ajuste de límites
          if (modalStyle.left && (modalStyle.left as number) + MODAL_WIDTH > window.innerWidth - 20) {
            modalStyle.left = window.innerWidth - MODAL_WIDTH - 20;
          }
          if (modalStyle.left && (modalStyle.left as number) < 20) {
            modalStyle.left = 20;
          }
          if (modalStyle.top && (modalStyle.top as number) < 20) {
            modalStyle.top = 20;
          }
          if (modalStyle.top && (modalStyle.top as number) + MODAL_HEIGHT > window.innerHeight - 20) {
            modalStyle.top = window.innerHeight - MODAL_HEIGHT - 20;
          }

          // Aplicar estilos y marcar como posicionado
          modalRef.current.style.top = `${modalStyle.top}px`;
          modalRef.current.style.left = `${modalStyle.left}px`;
          modalRef.current.style.transform = `none`;
          setIsPositioned(true);
        }
      };

      const timeout = setTimeout(updateBoundsAndPosition, 350);

      updateBoundsAndPosition();
      window.addEventListener('resize', updateBoundsAndPosition);
      window.addEventListener('scroll', updateBoundsAndPosition);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('resize', updateBoundsAndPosition);
        window.removeEventListener('scroll', updateBoundsAndPosition);
        setIsPositioned(false);
      };
    }, [activeStep]);

    if (!isTourOpen || !activeStep || !bounds) return null;

    const totalSteps = TOUR_STEPS.length;
    const isFirst = activeStep.id === 1;
    const isLast = activeStep.id === totalSteps;


    return (
      // Contenedor principal con posicionamiento FIXED (estable al scroll)
      <div className="fixed inset-0 z-[1000] pointer-events-none">

        {/* Overlay Oscuro (Dividido en 4 partes para crear el "agujero") */}
        <div className="absolute inset-0 bg-transparent">
          {/* Top Shade */}
          <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
            top: 0, left: 0, right: 0, height: bounds.top,
          }}></div>
          {/* Bottom Shade */}
          <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
            top: bounds.top + bounds.height, left: 0, right: 0, bottom: 0,
          }}></div>
          {/* Left Shade */}
          <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
            top: bounds.top, left: 0, width: bounds.left, height: bounds.height,
          }}></div>
          {/* Right Shade */}
          <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
            top: bounds.top, left: bounds.left + bounds.width, right: 0, height: bounds.height,
          }}></div>
        </div>

        {/* Contenedor del modal (usando posición fija para que se quede en pantalla) */}
        <div
          ref={modalRef}
          className={`fixed z-[1001] w-80 p-0 rounded-xl shadow-2xl transition-opacity duration-200 ${isPositioned ? 'opacity-100' : 'opacity-0'}`}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="bg-gray-800 p-4 rounded-xl border border-purple-600 shadow-xl relative">
            {/* Botón de Cierre (Arriba a la derecha) */}
            <button
              onClick={closeTour}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
              aria-label="Cerrar tutorial"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-purple-400 mb-2 border-b border-gray-700 pb-2 pr-8">
              {activeStep.title}
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              {activeStep.text}
            </p>

            <div className="flex justify-between items-center pt-3 border-t border-gray-700">
              <div className="text-xs text-purple-400 font-medium">
                Paso {currentStep} de {totalSteps}
              </div>
              <div className="flex space-x-2">
                {/* Botón Anterior */}
                {!isFirst && (
                  <button
                    onClick={goToPrevStep}
                    className="px-3 py-1 text-sm rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                  >
                    Anterior
                  </button>
                )}

                {/* Botón Siguiente / Finalizar */}
                {!isLast ? (
                  <button
                    onClick={goToNextStep}
                    className="px-3 py-1 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                  >
                    {isFirst ? 'Comenzar' : 'Siguiente'}
                  </button>
                ) : (
                  <button
                    onClick={closeTour}
                    className="px-3 py-1 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
                  >
                    Finalizar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center text-white p-8">Cargando menú...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 p-4 bg-gray-800 rounded-xl"><AlertTriangle className="inline mr-2" />{error}</div>;
  }

  if (!localId) {
    return <div className="text-center text-gray-400 p-8">No se encontró un local asociado.</div>;
  }

  return (
    <>
      {/* Componente Modal del Tour */}
      <TourModal />

      <div className="bgFood2 min-h-screen text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold pt-12 text-white mb-2">Gestión de Menú</h1>
              <p className="text-gray-400">
                Crea, edita y organiza los platos de tu restaurante.
              </p>
            </div>
            {/* Botón de Ayuda "?" */}
            <button
              id="help-button"
              onClick={isTourOpen ? closeTour : startTour}
              className={`fixed top-20 right-6 z-[1002] p-3 rounded-full 
                            ${isTourOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white 
                            shadow-lg transition-transform duration-300 transform hover:scale-110`}
              title={isTourOpen ? "Cerrar Tutorial" : "Mostrar Tutorial"}
            >
              {isTourOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
            </button>
          </header>

          <section className="mb-8" id="creation-quick-links">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center border border-gray-700 hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                onClick={handleAddFood}
              >
                <FilePlus className="w-12 h-12 text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-white">Agregar Plato</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Crea un plato nuevo y personalízalo.
                </p>
              </div>
              <div
                className={`rounded-xl p-6 flex flex-col items-center text-center border transition-colors duration-300 ${!hasActiveSubscription ? 'bg-gray-800/50 border-gray-700/50 cursor-pointer relative overflow-hidden' : 'bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer'}`}
                onClick={() => {
                  if (!hasActiveSubscription) {
                    navigate('/business/subscription');
                  } else {
                    setShowOcrModal(true);
                  }
                }}
              >
                {!hasActiveSubscription && (
                  <div className="absolute top-2 right-2 flex items-center bg-amber-500/20 text-amber-500 text-xs font-bold px-2 py-1 rounded border border-amber-500/30">
                    <Lock className="w-3 h-3 mr-1" /> PRO
                  </div>
                )}
                <Upload className={`w-12 h-12 mb-3 ${!hasActiveSubscription ? 'text-gray-600' : 'text-purple-400'}`} />
                <h3 className={`text-lg font-semibold ${!hasActiveSubscription ? 'text-gray-500' : 'text-white'}`}>Subir con Foto</h3>
                <p className={`text-sm mt-1 ${!hasActiveSubscription ? 'text-gray-600' : 'text-gray-400'}`}>
                  {hasActiveSubscription ? 'Sube una imagen de un menú para extraer los datos.' : 'Desbloquea DualEat PRO para usar IA.'}
                </p>
              </div>
              <div
                className="bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center border border-gray-700 hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                onClick={() => setShowCreateCategoryModal(true)}
              >
                <PlusCircle className="w-12 h-12 text-green-400 mb-3" />
                <h3 className="text-lg font-semibold text-white">Nueva Categoría</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Agrega una nueva sección para tus platos.
                </p>
              </div>
            </div>
          </section>

          <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 mb-8" data-tour-id="filter-section">
            <div className="relative w-full mb-6" id="search-bar-container">
              <input
                type="text"
                placeholder="Buscar platos o descripciones..."
                className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e5a657] transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <div className="relative" id="categories-filter">
              {showArrows && !isAtStart && (
                <button
                  type="button"
                  title='Anterior'
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
                      className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-200 whitespace-nowrap text-sm font-medium ${selectedCategory === null
                        ? 'bg-[#e5a657] text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <Tag className="w-4 h-4" />
                      <span>Todos</span>
                    </button>
                    {localCategories.map(category => (
                      <div key={category.id} className="relative flex-shrink-0">
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-200 whitespace-nowrap text-sm font-medium ${selectedCategory === category.id
                            ? 'bg-[#e5a657] text-white shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <Tag className="w-4 h-4" />
                          <span>{category.name}</span>
                        </button>

                        <button
                          type="button"
                          title="Eliminar categoría"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteCategoryModal(category.id);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500/80 p-1 rounded-full text-white hover:bg-red-600 transition-colors duration-200 z-30"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {showArrows && !isAtEnd && (
                <button
                  type='button'
                  title='Ir a la derecha'
                  onClick={() => scrollCategories('right')}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 bg-gray-900/90 hover:bg-gray-900 p-2 rounded-full shadow-lg z-20 transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>

          {extractedDishes.length > 0 && (
            <section className="bg-gray-800 p-6 rounded-xl space-y-4 mb-8">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span>Platos Extraídos (OCR)</span>
              </h3>
              <p className="text-gray-400 text-sm">
                Revisa los platos detectados por la IA.
                Puedes editar los nombres o precios antes de guardarlos.
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {extractedDishes.map((dish, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{dish.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">${dish.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                          <button
                            onClick={() => handleEditExtractedDish(dish)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Editar plato"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            type='button'
                            onClick={() => setExtractedDishes(extractedDishes.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700"
                            title="Eliminar de la lista de revisión"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleSaveAllExtractedDishes}
                disabled={extractedDishes.length === 0}
                className="w-full py-3 mt-4 bg-green-600 text-white font-semibold rounded-lg transition-colors hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Check className="inline w-5 h-5 mr-2" />
                Guardar Todos los Platos
              </button>
            </section>
          )}

          <section className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 mt-8" id="menu-items-section">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Platos del Menú</h3>
            {loading ?
              (
                <div className="text-center text-gray-400 p-8">Cargando platos... 🍽️</div>
              ) : error ?
                (
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
                                type="button"
                                title="Editar Plato"
                                className="bg-gray-900/70 backdrop-blur-sm p-2 rounded-full text-blue-400 hover:text-blue-200 transition-colors"
                                onClick={() => handleUpdateFood(food)}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Eliminar Plato"
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
                                <StatPill text={`${food.votes_up} Likes`} color="bg-green-500/20 text-green-400" icon={TrendingUp} />
                                <StatPill text={`${food.votes_down} Dislikes`} color="bg-red-500/20 text-red-400" icon={TrendingDown} />
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
          categories={localCategories}
          onClose={() => setIsModalOpen(false)}
          onSave={handleOnSave}
        />
      )}

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsConfirmModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-gray-900 shadow-2xl border border-gray-700/50 animate-modal-in overflow-hidden">
            <div className="p-2 bg-gradient-to-r from-[#B53325] to-[#d94a36]" />
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
                type="button"
                aria-label="Close"
                onClick={() => setIsConfirmModalOpen(false)}
                className="group p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-300 mb-6">
                ¿Estás seguro de que quieres ELIMINAR este plato?
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-6 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 hover:text-white rounded-xl transition-all duration-200 font-semibold border border-gray-600/30 hover:border-gray-500/50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
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

      {showOcrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowOcrModal(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gray-900 shadow-2xl border border-gray-700/50 animate-modal-in">
            <button
              type="button"
              aria-label="Cerrar modal"
              onClick={() => setShowOcrModal(false)}
              className="absolute top-4 right-4 group p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 z-10"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </button>
            <div className="p-6">
              <UploadMenuSection
                localId={localId}
                onDishesExtracted={handleExtractedDishes}
                onSuccess={() => setShowOcrModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showCreateCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => { setShowCreateCategoryModal(false); setNewCategoryName(''); setSelectedPredefinedCategory(''); setNewCategoryError(null); }}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-gray-700/50 animate-modal-in">
            <div className="relative flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Crear Nueva Categoría
                  </h2>
                </div>
              </div>
              <button
                type="button"
                title='Cerrar'
                onClick={() => { setShowCreateCategoryModal(false); setNewCategoryName(''); setSelectedPredefinedCategory(''); setNewCategoryError(null); }}
                className="group p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
            <div className="p-6">
              <label htmlFor="predefined-category" className="block text-gray-400 text-sm font-semibold mb-2">
                Elegir de una lista
              </label>
              <select
                id="predefined-category"
                value={selectedPredefinedCategory}
                onChange={(e) => { setSelectedPredefinedCategory(e.target.value); setNewCategoryName(''); }}
                disabled={!!newCategoryName.trim()}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e5a657] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <option value="">-- Seleccionar --</option>
                {predefinedCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">o</span>
                <div className="flex-grow border-t border-gray-600"></div>
              </div>
              <label htmlFor="new-category" className="block text-gray-400 text-sm font-semibold mb-2">
                Crear una nueva
              </label>
              <input
                type="text"
                id="new-category"
                placeholder="Nombre de la categoría"
                value={newCategoryName}
                onChange={(e) => { setNewCategoryName(e.target.value); setSelectedPredefinedCategory(''); }}
                disabled={!!selectedPredefinedCategory}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e5a657] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              />
              {newCategoryError && (
                <p className="mt-2 text-red-400 text-sm font-semibold">{newCategoryError}</p>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCreateLocalCategory}
                  disabled={loading || (!selectedPredefinedCategory && !newCategoryName.trim())}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg transition-colors hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creando...' : 'Crear Categoría'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowDeleteCategoryModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-gray-900 shadow-2xl border border-gray-700/50 animate-modal-in overflow-hidden">
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600" />
            <div className="relative flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Confirmar Eliminación
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteCategoryModal(false)}
                className="group p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-300 mb-6">
                ¿Estás seguro de que deseas eliminar esta categoría? Esta acción es irreversible.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteCategoryModal(false)}
                  className="px-6 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 hover:text-white rounded-xl transition-all duration-200 font-semibold border border-gray-600/30 hover:border-gray-500/50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCategory}
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