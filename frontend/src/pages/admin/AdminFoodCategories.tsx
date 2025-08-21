import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSave, FaSearch } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface FoodCategory {
  id: number;
  name: string;
  tipo: string;
  description: string | null;
  icon_url: string | null;
}

const categoryTypes = [
  'Tipos_de_comida',
  'Estilos_o_dietas',
  'Origen_y_cultura',
];

const AdminFoodCategories: React.FC = () => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<{ 
    id: number | null;
    name: string;
    tipo: string;
    description: string | null;
    icon_url: string | null;
  }>({
    id: null,
    name: '',
    tipo: categoryTypes[0],
    description: '',
    icon_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const API_URL = 'http://localhost:3000/admin/food-categories';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setCategories(response.data);
    } catch (error) {
      setMessage('Error al cargar las categorías.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenCreateForm = () => {
    setFormData({ id: null, name: '', tipo: categoryTypes[0], description: '', icon_url: '' });
    setShowForm(true);
  };

  const handleOpenEditForm = (category: FoodCategory) => {
    setFormData({ ...category });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.tipo.trim()) {
      setMessage('El nombre y el tipo son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      if (formData.id) {
        const response = await axios.put(`${API_URL}/${formData.id}`, formData);
        setCategories(categories.map(cat => (cat.id === formData.id ? response.data : cat)));
        setMessage('Categoría actualizada exitosamente.');
      } else {
        const response = await axios.post(API_URL, formData);
        setCategories([...categories, response.data]);
        setMessage('Categoría creada exitosamente.');
      }
      setShowForm(false);
    } catch (error) {
      setMessage(`Error al guardar la categoría.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`);
      setCategories(categories.filter(cat => cat.id !== id));
      setMessage('Categoría eliminada exitosamente.');
    } catch (error) {
      setMessage('Error al eliminar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative w-full min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Gestor de Categorías</h1>

      {/* Main Control Panel */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, tipo o descripción..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={handleOpenCreateForm}
          className="mt-4 md:mt-0 px-6 py-3 bg-[#b53325] text-white rounded-full font-bold shadow-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <FaPlus /> Nueva Categoría
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`text-center p-3 rounded-lg font-semibold mb-4 ${message.startsWith('Error') ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
          {message}
        </div>
      )}

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 relative group flex flex-col justify-between"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{category.icon_url}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{category.tipo.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              </div>
              
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => handleOpenEditForm(category)}
                  className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {filteredCategories.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-12 text-lg">No se encontraron categorías.</div>
      )}

      {/* Floating Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseForm}
          >
            <motion.div
              initial={{ y: -50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -50, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">{formData.id ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre de la categoría"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {categoryTypes.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md">
                  <span className="text-2xl">{formData.icon_url}</span>
                  <input
                    type="text"
                    name="icon_url"
                    value={formData.icon_url || ''}
                    onChange={handleInputChange}
                    placeholder="Icono (ej. 🍔)"
                    className="flex-1 focus:outline-none"
                  />
                </div>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition disabled:bg-gray-400 flex items-center gap-2"
                >
                  <FaSave /> {formData.id ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFoodCategories;