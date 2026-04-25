import { useState, useEffect } from "react";
import { axiosInterceptor as axios } from "@/api/interceptor/axios-interceptor";
import {
    FaUsers,
    FaSearch,
    FaUserShield,
    FaUserSlash,
    FaUserCheck,
    FaEnvelope,
    FaCalendarAlt,
    FaArrowLeft
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import ConfirmModal from "@/components/modal/ConfirmModal";

interface User {
    id: string;
    name: string;
    email: string;
    active: boolean;
    avatar_url: string | null;
    is_business: boolean;
    created_at: string;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [confirmData, setConfirmData] = useState<{
        isOpen: boolean;
        user: User | null;
    }>({ isOpen: false, user: null });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/admin/users");
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            setMessage("Error al cargar la base de usuarios.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!confirmData.user) return;

        const user = confirmData.user;
        const newStatus = !user.active;

        try {
            const response = await axios.put(`/admin/users/${user.id}/status`, { active: newStatus });
            if (response.data.success) {
                setUsers(users.map(u => u.id === user.id ? { ...u, active: newStatus } : u));
                setMessage(`Usuario ${user.name} ${newStatus ? 'activado' : 'desactivado'} correctamente.`);
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (error) {
            setMessage("Error al actualizar el estado del usuario.");
        } finally {
            setConfirmData({ isOpen: false, user: null });
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full min-h-screen bg-[#FDFDFD] font-sans pb-10">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm px-10 py-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
                        className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-[#b53325] transition-all"
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
                        <FaUsers className="text-white text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Base de Usuarios</h1>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                            Gestión global de cuentas y accesos de DualEat
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Alerts */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-blue-50 border border-blue-100 text-blue-700 px-6 py-4 rounded-2xl font-bold mb-8 text-center shadow-sm"
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Users Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest font-black">
                                    <th className="px-8 py-5">Perfil</th>
                                    <th className="px-8 py-5">Información</th>
                                    <th className="px-8 py-5">Rol / Tipo</th>
                                    <th className="px-8 py-5">Fecha de Ingreso</th>
                                    <th className="px-8 py-5 text-center">Estado</th>
                                    <th className="px-8 py-5 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-8 py-10 bg-white" />
                                        </tr>
                                    ))
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="relative">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shadow-sm" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl border border-gray-200">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    {user.is_business && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#b53325] rounded-full border-2 border-white flex items-center justify-center" title="Dueño de Negocio">
                                                            <FaUserShield className="text-white text-[8px]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-lg font-bold text-gray-800 leading-none">{user.name}</p>
                                                <div className="flex items-center gap-1 mt-1 text-gray-400 text-sm">
                                                    <FaEnvelope className="text-[10px]" />
                                                    <span>{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${user.is_business ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                    {user.is_business ? 'Negocio' : 'Usuario Común'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-gray-500 font-medium text-sm">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className="text-gray-300" />
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${user.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                        {user.active ? 'ACTIVO' : 'SUSPENDIDO'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => setConfirmData({ isOpen: true, user: user })}
                                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm transform hover:scale-110 ${user.active ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                        title={user.active ? "Suspender cuenta" : "Activar cuenta"}
                                                    >
                                                        {user.active ? <FaUserSlash /> : <FaUserCheck />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {!loading && filteredUsers.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                                <FaUsers className="text-6xl mb-4 opacity-20" />
                                <p className="text-xl font-bold">No se encontraron usuarios</p>
                                <p className="text-sm">Prueba con otros términos de búsqueda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmData.isOpen}
                onClose={() => setConfirmData({ isOpen: false, user: null })}
                onConfirm={handleToggleActive}
                title={confirmData.user?.active ? "Suspender Usuario" : "Activar Usuario"}
                message={`¿Estás seguro de que deseas ${confirmData.user?.active ? 'suspender' : 'activar'} la cuenta de ${confirmData.user?.name}?`}
                type={confirmData.user?.active ? "danger" : "success"}
                confirmText={confirmData.user?.active ? "Suspender" : "Activar"}
            />
        </div>
    );
};

export default AdminUsers;
