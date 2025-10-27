import React, { useState } from 'react';
import axios from 'axios';

const AdminBusinessCreation  = () => {
  const [formData, setFormData] = useState({
    userData: { name: '', email: '', password: '' },
    businessData: { name: '' },
    localData: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      image_url: '',
      categorias_menu: [''],
    },
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Lógica mejorada para manejar todos los campos de forma clara
    if (['name', 'email', 'password'].includes(name)) { 
      setFormData(prev => ({ ...prev, userData: { ...prev.userData, [name]: value } }));
    } else if (name === 'businessName') {
      setFormData(prev => ({ ...prev, businessData: { ...prev.businessData, name: value } }));
    } else if (name === 'localName') { // <-- CORRECCIÓN: Maneja explícitamente el nombre del local
      setFormData(prev => ({ ...prev, localData: { ...prev.localData, name: value } }));
    } else {
      // Maneja el resto de los campos de localData
      setFormData(prev => ({ ...prev, localData: { ...prev.localData, [name]: value } }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Creando negocio...');

    try {
      const response = await axios.post('http://localhost:3000/admin/business', formData);
      setMessage(`Éxito: ${response.data.message}`);
      setFormData({
        userData: { name: '', email: '', password: '' },
        businessData: { name: '' },
        localData: {
          name: '',
          description: '',
          address: '',
          phone: '',
          email: '',
          image_url: '',
          categorias_menu: [''],
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(`Error: ${error.response.data.message}`);
      } else {
        setMessage('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Crear Nuevo Negocio</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Datos del Usuario Dueño</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.userData.name}
                onChange={handleInputChange}
                placeholder="Nombre completo"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
            <div className='mt-4'>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.userData.email}
                onChange={handleInputChange}
                placeholder="Email del dueño"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 mt-4">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.userData.password}
                onChange={handleInputChange}
                placeholder="Contraseña"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Datos del Negocio y Local</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre del negocio"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="localName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del local</label>
                <input
                  type="text"
                  id="localName"
                  name="localName"
                  value={formData.localData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre del local"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección del local</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.localData.address}
                  onChange={handleInputChange}
                  placeholder="Dirección completa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.localData.phone}
                  onChange={handleInputChange}
                  placeholder="Teléfono del local"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="image_url"
                  value={formData.localData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.localData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descripción del local"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition transform ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#b53325] hover:bg-red-700 active:scale-95'
            }`}
          >
            {loading ? 'Creando...' : 'Crear Negocio'}
          </button>
        </form>
        {message && (
          <p className={`mt-6 text-center text-sm font-medium ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminBusinessCreation;