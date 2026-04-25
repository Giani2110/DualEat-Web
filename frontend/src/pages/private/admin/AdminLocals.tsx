import { useState, useEffect } from 'react';
import { axiosInterceptor as axios } from '@/api/interceptor/axios-interceptor';
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaStore,
  FaMapMarkerAlt,
  FaEnvelope,
  FaCheckCircle,
  FaImage
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import ConfirmModal from '@/components/modal/ConfirmModal';

interface Local {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  type_local: string;
  image_url: string;
  latitude: number;
  longitude: number;
  average_rating: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminLocals = () => {
  const [locals, setLocals] = useState<Local[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Local>>({
    id: '',
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    image_url: '',
    type_local: 'Restaurante',
    latitude: -34.6037,
    longitude: -58.3816,
    active: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    isOpen: boolean;
    localId: string | null;
  }>({ isOpen: false, localId: null });

  const API_URL = '/admin/locals';
  const placeholderImageUrl = 'https://placehold.co/600x400/png?text=DualEat+Local';

  useEffect(() => {
    fetchLocals();
  }, []);

  const fetchLocals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setLocals(response.data);
    } catch (error) {
      showMsg('Error al cargar los locales.');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target.type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenEditForm = (local: Local) => {
    setFormData({ ...local, image_url: local.image_url || '' });
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      showMsg('El nombre es obligatorio.');
      return;
    }
    setLoading(true);
    try {
      // Solo enviamos los campos sanitizados (aunque el backend ya lo hace, ayudamos al frontend)
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        type_local: formData.type_local,
        image_url: formData.image_url,
        latitude: formData.latitude,
        longitude: formData.longitude,
        active: formData.active,
      };

      const response = await axios.put(`${API_URL}/${formData.id}`, dataToSave);
      setLocals(locals.map(local => (local.id === formData.id ? response.data : local)));
      showMsg('Local actualizado exitosamente.');
      setShowDrawer(false);
    } catch (error: any) {
      showMsg(`Error al guardar el local: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocal = async () => {
    if (!confirmData.localId) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${confirmData.localId}`);
      setLocals(locals.filter(local => local.id !== confirmData.localId));
      showMsg('Local eliminado exitosamente.');
    } catch (error) {
      showMsg('Error al eliminar el local.');
    } finally {
      setLoading(false);
      setConfirmData({ isOpen: false, localId: null });
    }
  };

  const filteredLocals = locals.filter(local =>
    local.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (local.description && local.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (local.address && local.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (local.email && local.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      {/* HEADER */}
      <div className="bg-white border-b border-[#f0f0f0] px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#c4c4c4] mb-0.5">
            Administración
          </p>
          <h1 className="text-2xl font-bold text-[#111] m-0">
            Gestión de Locales
          </h1>
        </div>
        <div className="text-sm font-medium text-gray-500">
          {filteredLocals.length} locales encontrados
        </div>
      </div>

      <div className="p-8">
        {/* SEARCH BAR */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, dirección o email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#e5e7eb] rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* TILES CONTAINER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredLocals.map((local) => (
              <motion.div
                key={local.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white rounded-2xl shadow-sm border border-[#efefef] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={local.image_url || placeholderImageUrl}
                    alt={local.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${local.active
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                      {local.active ? 'ACTIVO' : 'PENDIENTE'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-[#111] truncate">{local.name}</h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <FaMapMarkerAlt className="mr-2 text-gray-300 flex-shrink-0" />
                      <span className="truncate">{local.address}</span>
                    </div>
                    {local.email && (
                      <div className="flex items-center text-xs text-gray-500">
                        <FaEnvelope className="mr-2 text-gray-300 flex-shrink-0" />
                        <span className="truncate">{local.email}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px] mb-6">
                    {local.description || 'Sin descripción disponible.'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[#f5f5f5]">
                    <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      {local.type_local || 'RESTAURANTE'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditForm(local)}
                        className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Editar Local"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmData({ isOpen: true, localId: local.id })}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Eliminar Local"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredLocals.length === 0 && !loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-[#efefef] flex items-center justify-center mb-6">
              <FaStore className="text-gray-200 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-[#555] mb-2">No se encontraron locales</h3>
            <p className="text-gray-400 text-sm">Prueba ajustando tu búsqueda o filtros.</p>
          </div>
        )}
      </div>

      {/* DRAWER / SIDE PANEL */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.1)] z-[101] flex flex-col"
            >
              <div className="px-8 py-6 border-b border-[#f0f0f0] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#c4c4c4] mb-1">
                    Edición de Local
                  </p>
                  <h2 className="text-xl font-bold text-[#111]">Modificar Detalles</h2>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="w-10 h-10 flex items-center justify-center border border-[#e5e7eb] rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                {/* Visual Preview */}
                <div className="p-4 bg-[#fafafa] border border-[#f0f0f0] rounded-2xl flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <img
                      src={formData.image_url || placeholderImageUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">URL de Imagen</label>
                    <div className="relative">
                      <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input
                        type="text"
                        name="image_url"
                        value={formData.image_url || ''}
                        onChange={handleInputChange}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-[#e5e7eb] rounded-xl outline-none focus:border-red-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Main Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block">Nombre del Local</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      placeholder="Ej: DualEat Burger"
                      className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e7eb] rounded-xl outline-none focus:bg-white focus:border-red-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block">Tipo de Local</label>
                    <div className="relative">
                      <select
                        name="type_local"
                        value={formData.type_local || 'Restaurante'}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e7eb] rounded-xl outline-none focus:bg-white focus:border-red-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Restaurante">Restaurante</option>
                        <option value="Bar">Bar</option>
                        <option value="Café">Café</option>
                        <option value="Pizzería">Pizzería</option>
                        <option value="Heladería">Heladería</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block">Dirección</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        placeholder="Calle 123..."
                        className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e7eb] rounded-xl outline-none focus:bg-white focus:border-red-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block">Teléfono</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        placeholder="+54 11..."
                        className="w-full px-4 py-2.5 bg-[#fafafa] border border-[#e5e7eb] rounded-xl outline-none focus:bg-white focus:border-red-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Estado Tostado / Switch */}
                  <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${formData.active
                    ? 'bg-green-50/50 border-green-100'
                    : 'bg-amber-50/50 border-amber-100'
                    }`}>
                    <div>
                      <h4 className={`text-sm font-bold ${formData.active ? 'text-green-700' : 'text-amber-700'}`}>
                        {formData.active ? 'Local Aprobado' : 'Aprobación Pendiente'}
                      </h4>
                      <p className="text-[11px] text-gray-500">¿Habilitar el local para el público?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block">Descripción</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      placeholder="Cuéntanos más sobre el local..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e7eb] rounded-xl outline-none focus:bg-white focus:border-red-500 transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-[#f0f0f0] bg-gray-50/50 space-y-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full h-12 bg-[#111] text-white rounded-xl font-bold hover:bg-[#2d2d2d] transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaCheckCircle />}
                  Guardar Cambios
                </button>
                <button
                  onClick={handleCloseDrawer}
                  className="w-full h-12 bg-white text-gray-500 rounded-xl font-bold border border-[#e5e7eb] hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ isOpen: false, localId: null })}
        onConfirm={handleDeleteLocal}
        title="Eliminar Local"
        message="¿Estás seguro de que quieres eliminar este local de forma permanente?"
        type="danger"
        confirmText="Eliminar"
      />

      {/* TOAST MESSAGE */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm ${message.includes('Error') ? 'bg-red-600 text-white' : 'bg-black text-white'
              }`}
          >
            {message.includes('Error') ? '⚠️' : '✓'}
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLocals;