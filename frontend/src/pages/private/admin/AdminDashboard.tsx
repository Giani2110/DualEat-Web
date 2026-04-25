import { useState, useEffect } from "react";
import { axiosInterceptor as axios } from "@/api/interceptor/axios-interceptor";
import {
    FaUsers,
    FaLayerGroup,
    FaUsersCog,
    FaClock,
    FaCheckCircle,
    FaArrowRight,
    FaChartLine
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";

interface AdminStats {
    totalUsers: number;
    pendingLocals: number;
    activeLocals: number;
    totalFoodCategories: number;
    totalCommunities: number;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/admin/dashboard/stats");
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }: any) => (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 bg-gradient-to-br ${color}`} />

            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} shadow-lg shadow-gray-200 text-white`}>
                    <Icon className="text-2xl" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</span>
                    <div className="text-3xl font-black text-gray-800 mt-1">
                        {loading ? <div className="w-12 h-8 bg-gray-100 animate-pulse rounded" /> : value}
                    </div>
                </div>
            </div>

            <div>
                <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-[#b53325] font-bold text-xs uppercase tracking-wider group-hover:gap-2 transition-all">
                    <span>Gestionar ahora</span>
                    <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-12">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 shadow-sm px-10 py-10 mb-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="bg-gradient-to-br from-[#b53325] to-[#E5A657] p-4 rounded-3xl shadow-xl shadow-red-100 transform -rotate-3">
                            <FaChartLine className="text-white text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-800 tracking-tight leading-none">
                                Panel de Control
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {/* Urgent Stats */}
                <StatCard
                    title="Locales en Espera"
                    value={stats?.pendingLocals || 0}
                    icon={FaClock}
                    color="from-amber-400 to-orange-500"
                    subtitle="Negocios que esperan tu revisión para unirse"
                    onClick={() => navigate(ROUTES.ADMIN.LOCALS)}
                />

                <StatCard
                    title="Locales Activos"
                    value={stats?.activeLocals || 0}
                    icon={FaCheckCircle}
                    color="from-emerald-400 to-teal-500"
                    subtitle="Comercios operando en DualEat"
                    onClick={() => navigate(ROUTES.ADMIN.LOCALS)}
                />

                <StatCard
                    title="Base de Usuarios"
                    value={stats?.totalUsers || 0}
                    icon={FaUsers}
                    color="from-blue-400 to-indigo-600"
                    subtitle="Nuestra comunidad creciendo día a día"
                    onClick={() => navigate(ROUTES.ADMIN.USERS)}
                />

                <StatCard
                    title="Categorías Maestras"
                    value={stats?.totalFoodCategories || 0}
                    icon={FaLayerGroup}
                    color="from-[#b53325] to-red-600"
                    subtitle="Estructura del menú y filtros globales"
                    onClick={() => navigate(ROUTES.ADMIN.FOOD_CATEGORIES)}
                />

                <StatCard
                    title="Comunidades"
                    value={stats?.totalCommunities || 0}
                    icon={FaUsersCog}
                    color="from-purple-400 to-violet-600"
                    subtitle="Espacios de interacción y descubrimiento"
                    onClick={() => { }}
                />
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
