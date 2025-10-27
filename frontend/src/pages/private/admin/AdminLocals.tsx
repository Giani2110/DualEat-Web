import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaSearch } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface Local {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  image_url: string;
  opening_time: string | null;
  closing_time: string | null;
  business_id: number;
}

const AdminLocals = () => {
  const [locals, setLocals] = useState<Local[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<{ 
    id: number | null;
    name: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    image_url: string;
    opening_time: string | null;
    closing_time: string | null;
    business_id: number | null;
  }>({
    id: null,
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    image_url: '',
    opening_time: null,
    closing_time: null,
    business_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  // URL corregida para que coincida con la ruta de tu servidor Express
  const API_URL = 'http://localhost:3000/api/admin/locals';
  const placeholderImageUrl = 'https://via.placeholder.com/400';

  useEffect(() => {
    fetchLocals();
  }, []);

  const fetchLocals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setLocals(response.data);
    } catch (error) {
      setMessage('Error al cargar los locales.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenEditForm = (local: Local) => {
    setFormData({ ...local, image_url: local.image_url || '' });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.business_id) {
      setMessage('El nombre y el ID del negocio son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      // Actualizar local existente
      const response = await axios.put(`${API_URL}/${formData.id}`, formData);
      setLocals(locals.map(local => (local.id === formData.id ? response.data : local)));
      setMessage('Local actualizado exitosamente.');
      setShowForm(false);
    } catch (error: any) {
      setMessage(`Error al guardar el local: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocal = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este local?')) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${id}`);
      setLocals(locals.filter(local => local.id !== id));
      setMessage('Local eliminado exitosamente.');
    } catch (error) {
      setMessage('Error al eliminar el local.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocals = locals.filter(local =>
    local.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (local.description && local.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (local.address && local.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (local.email && local.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative w-full min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Gestor de Locales</h1>

      {/* Panel de control principal */}
      <div className="flex flex-col md:flex-row justify-center items-center mb-8">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, dirección o email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Mensajes de estado */}
      {message && (
        <div className={`text-center p-3 rounded-lg font-semibold mb-4 ${message.startsWith('Error') ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
          {message}
        </div>
      )}

      {/* Grid de tarjetas de locales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredLocals.map((local) => (
            <motion.div
              key={local.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 relative group flex flex-col justify-between"
            >
              <div className="flex-grow">
                <img 
                  src={local.image_url || placeholderImageUrl} 
                  alt={local.name} 
                  className="w-full h-40 object-cover rounded-md mb-4" 
                />
                <h3 className="text-xl font-bold text-gray-800">{local.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{local.address}</p>
                <p className="text-xs text-gray-500">{local.description}</p>
              </div>
              
              <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => handleOpenEditForm(local)}
                  className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteLocal(local.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {filteredLocals.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-12 text-lg">No se encontraron locales.</div>
      )}

      {/* Formulario flotante (modal) */}
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
              className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md space-y-4"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Editar Local</h2>
              
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nombre del local"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="Dirección"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="image_url"
                value={formData.image_url || ''}
                onChange={handleInputChange}
                placeholder="URL de la imagen"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="business_id"
                value={formData.business_id || ''}
                onChange={handleInputChange}
                placeholder="ID del negocio asociado"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled // Deshabilitamos la edición de este campo para evitar errores
              />
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Descripción del local"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />

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
                  <FaSave /> Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLocals;