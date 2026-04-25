import React, { useState } from 'react';
import { axiosInterceptor as axios } from "@/api/interceptor/axios-interceptor";
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Store,
  Mail,
  Lock,
  MapPin,
  Phone,
  Image as ImageIcon,
  FileText,
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/api/constants/constants';
import ConfirmModal from '@/components/modal/ConfirmModal';

const AdminBusinessCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userData: { name: '', email: '', password: '' },
    localData: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      image_url: '',
      type_local: 'Restaurante',
      latitude: -34.6037,
      longitude: -58.3816,
      categorias_menu: [''],
    },
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => { },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (['name', 'email', 'password'].includes(name)) {
      setFormData(prev => ({ ...prev, userData: { ...prev.userData, [name]: value } }));
    } else if (name === 'localName') {
      setFormData(prev => ({ ...prev, localData: { ...prev.localData, name: value } }));
    } else {
      setFormData(prev => ({ ...prev, localData: { ...prev.localData, [name]: value } }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/admin/business', formData);
      if (response.data.success || response.status === 201) {
        setSuccessData(response.data.data);
        setConfirmModal({
          isOpen: true,
          title: '¡Creación Exitosa!',
          message: 'El usuario, el negocio y el local han sido creados correctamente. ¿Deseas ir a la lista de locales o seguir editando?',
          type: 'success',
          onConfirm: () => navigate(ROUTES.ADMIN.LOCALS),
        });
      }
    } catch (error: any) {
      setConfirmModal({
        isOpen: true,
        title: 'Error en la creación',
        message: error.response?.data?.message || 'Ocurrió un error al intentar crear el negocio.',
        type: 'danger',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-[#b53325] to-[#E5A657] rounded-3xl shadow-xl mb-6 transform -rotate-3"
          >
            <Building2 className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Alta Manual de Negocio</h1>
          <p className="text-gray-500 text-lg">Configuración rápida de dueños y establecimientos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Dueño */}
          <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-100 rounded-2xl">
                  <User className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Información del Dueño</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  label="Nombre Completo"
                  id="name"
                  name="name"
                  value={formData.userData.name}
                  onChange={handleInputChange}
                  icon={<User className="w-5 h-5" />}
                  placeholder="Ej: Juan Pérez"
                  required
                />
                <InputGroup
                  label="Correo Electrónico"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.userData.email}
                  onChange={handleInputChange}
                  icon={<Mail className="w-5 h-5" />}
                  placeholder="juan@ejemplo.com"
                  required
                />
                <InputGroup
                  label="Contraseña Temporal"
                  id="password"
                  name="password"
                  type="password"
                  value={formData.userData.password}
                  onChange={handleInputChange}
                  icon={<Lock className="w-5 h-5" />}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Negocio & Local */}
          <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-16 -mt-16 opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-yellow-100 rounded-2xl">
                  <Store className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Detalles del Establecimiento</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  label="Nombre del Local"
                  id="localName"
                  name="localName"
                  value={formData.localData.name}
                  onChange={handleInputChange}
                  icon={<Store className="w-5 h-5" />}
                  placeholder="Ej: DualEat Central"
                  required
                />
                <InputGroup
                  label="Tipo de Local"
                  id="type_local"
                  name="type_local"
                  value={formData.localData.type_local}
                  onChange={handleInputChange}
                  icon={<Building2 className="w-5 h-5" />}
                  placeholder="Ej: Restaurante, Bar, etc."
                  required
                />
                <div className="md:col-span-2">
                  <InputGroup
                    label="Dirección"
                    id="address"
                    name="address"
                    value={formData.localData.address}
                    onChange={handleInputChange}
                    icon={<MapPin className="w-5 h-5" />}
                    placeholder="Calle Falsa 123, Ciudad"
                  />
                </div>
                <InputGroup
                  label="Teléfono"
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.localData.phone}
                  onChange={handleInputChange}
                  icon={<Phone className="w-5 h-5" />}
                  placeholder="+54 9 11 ..."
                />
                <InputGroup
                  label="URL Imagen (Banner)"
                  id="imageUrl"
                  name="image_url"
                  value={formData.localData.image_url}
                  onChange={handleInputChange}
                  icon={<ImageIcon className="w-5 h-5" />}
                  placeholder="https://..."
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Descripción del Local</label>
                  <div className="relative">
                    <div className="absolute left-4 top-4 text-gray-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.localData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Breve reseña del local..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-700 resize-none shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full group relative py-5 px-6 rounded-3xl font-black text-xl shadow-2xl transition-all flex items-center justify-center space-x-3 overflow-hidden ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#b53325] hover:bg-black text-white hover:shadow-red-200/50'
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-yellow-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              {loading ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Crear Negocio Completo</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        <AnimatePresence>
          {successData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 bg-green-50 rounded-3xl border border-green-100 flex items-center gap-4"
            >
              <div className="p-3 bg-green-100 rounded-2xl">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-green-800 font-bold">¡Sistema Listo!</p>
                <p className="text-green-600 text-sm">El negocio se ha configurado con éxito.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Continuar a Locales"
      />
    </div>
  );
};

const InputGroup = ({ label, icon, ...props }: any) => (
  <div className="space-y-2">
    <label htmlFor={props.id} className="block text-sm font-bold text-gray-700 ml-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-gray-800 shadow-inner"
      />
    </div>
  </div>
);

export default AdminBusinessCreation;
