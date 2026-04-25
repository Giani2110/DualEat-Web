/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
    XCircle, AlertCircle, Zap, Archive,
    Package, Loader2, CheckCircle, TrendingUp,
    Calendar,
} from 'lucide-react';
import { AuthContext } from '@/context/auth/AuthContext';
import SubscriptionPlansModal from '../../../components/private/locals/SubscriptionPlansModal';

// ----------------------------------------------------------------------
// Interfaces y API (sin cambios, solo se asume que funcionan)
// ----------------------------------------------------------------------

type SubscriptionStatusMP = 'inactive' | 'authorized' | 'active' | 'paused' | 'cancelled' | 'finished';

interface SubscriptionData {
    id: string;
    mp_preapproval_id: string;
    subscription_type: 'LOCAL' | 'COMMUNITY_USER';
    plan: 'LOCAL_MONTHLY' | 'LOCAL_ANNUAL';
    amount: number;
    currency_id: string;
    status: SubscriptionStatusMP;
    start_date: string;
    next_payment_date: string | null;
    end_date: string | null;
    auto_renew: boolean;
    payment_history: any;
}

interface PaymentHistoryItem {
    date: string;
    amount: number;
    status: string;
    reference_id: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const fetchLocalSubscriptionData = async (localId: string): Promise<SubscriptionData | null> => {
    // ... (Implementación de la API)
    if (!localId) return null;
    const response = await fetch(`${API_BASE}/subscription/local/${localId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 404) return null;
    if (!response.ok) {
        throw new Error(`Error ${response.status} al obtener la suscripción.`);
    }
    const data = await response.json();
    return data as SubscriptionData | null;
};

// API removidas sobre renovación


// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------

const LocalSubscription: React.FC = () => {
    const authContext = useContext(AuthContext);

    const userId = authContext?.user?.id;
    const localIdFromContext = (authContext?.user as any)?.local_users?.[0]?.local_id;

    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [resolvedLocalId, setResolvedLocalId] = useState<string | null>(null);

    const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);


    // --- Helpers ---
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'ARS', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getStatusLabel = (status: SubscriptionStatusMP) => {
        switch (status) {
            case 'active': return 'Activa';
            case 'paused': return 'Pausada';
            case 'cancelled': return 'Cancelada';
            case 'authorized': return 'Pendiente';
            case 'finished': return 'Finalizada';
            case 'inactive': return 'Inactiva';
            default: return 'Desconocido';
        }
    };

    // --- Recarga de Datos para Consistencia ---
    const loadSubscription = async (idToLoad: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchLocalSubscriptionData(idToLoad);
            setSubscription(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al obtener la información de la suscripción.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const initializeSubscription = async () => {
            if (!userId) {
                setLoading(false);
                setError('Error: El usuario no está autenticado.');
                return;
            }

            let currentLocalId: string | null = localIdFromContext ? String(localIdFromContext) : null;

            if (!currentLocalId) {
                try {
                    const response = await fetch(`${API_BASE}/users/${userId}/local`);

                    if (!response.ok) {
                        throw new Error(`Error ${response.status} al buscar el local.`);
                    }

                    const data = await response.json();

                    if (data?.id) {
                        currentLocalId = String(data.id);
                    }
                } catch (e: any) {
                    setError('Error al obtener el local asociado. Verifique el endpoint /users/:id/local.');
                    setLoading(false);
                    return;
                }
            }

            if (!currentLocalId) {
                setLoading(false);
                setSubscription(null);
                setResolvedLocalId(null);
                return;
            }

            setResolvedLocalId(currentLocalId);
            await loadSubscription(currentLocalId);
        };

        initializeSubscription();
    }, [userId, localIdFromContext]);


    // --- Handlers ---

    // Maneja la acción al iniciar el pago (y regresar de Mercado Pago)
    const handlePaymentInitiated = () => {
        setIsPlansModalOpen(false);
        // Podrías poner aquí un temporizador para recargar al volver de MP
        // if (resolvedLocalId) setTimeout(() => loadSubscription(resolvedLocalId), 3000); 
    }

    const historyData: PaymentHistoryItem[] = useMemo(() => {
        if (subscription && Array.isArray(subscription.payment_history)) {
            return (subscription.payment_history as PaymentHistoryItem[])
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        return [];
    }, [subscription]);

    const requiresNewPurchase =
        !resolvedLocalId ||
        !subscription ||
        subscription.status === 'inactive' ||
        subscription.status === 'finished';

    // --- Renderizado ---

    // NOTE: El fondo 'bgFood2' ya no tiene la clase 'min-h-screen' aquí
    // para que la imagen de fondo de la app principal sea la dominante.

    if (loading) return (
        <div className="BGLocal flex items-center justify-center p-8 min-h-screen">
            <div className="text-center bg-gray-800 p-6 rounded-xl shadow-lg">
                <Loader2 className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-400">Cargando datos de suscripción...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="BGLocal p-8 text-white min-h-screen">
            <h1 className="text-3xl pt-12 font-bold mb-6">Mi Pase</h1>
            <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg border border-red-700 text-red-400">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="font-semibold text-lg mb-2">Error Crítico</p>
                <p>{error}</p>
            </div>
        </div>
    );


    if (requiresNewPurchase) {
        return (
            <div className="BGLocal min-h-screen text-white p-6 md:p-12">
                <div className="max-w-6xl mx-auto">
                    <div className="pt-12 mb-10">
                        <h1 className="text-4xl font-bold mb-2 text-white">
                            Mi Pase DualEat PRO
                        </h1>
                        <p className="text-gray-400">
                            Potencia tu local con herramientas avanzadas y gestión profesional.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Panel de Estado Principal - Estilo Dashboard */}
                        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                            <div className="flex items-center gap-4 mb-8 border-b border-gray-700 pb-6">
                                <div className="p-3 bg-amber-600 rounded-xl">
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Estado: Inactivo</h2>
                                    <p className="text-gray-400 text-sm">Vuelve a PRO para desbloquear funciones</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-amber-500 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> Beneficios del Pase PRO
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex items-start gap-3">
                                            <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
                                            <div>
                                                <p className="font-bold text-white">Dashboard</p>
                                                <p className="text-xs text-gray-400">Métricas y estadísticas detalladas de ventas.</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-green-500 mt-1" />
                                            <div>
                                                <p className="font-bold text-white">Calendario</p>
                                                <p className="text-xs text-gray-400">Organiza tus días y eventos.</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex items-start gap-3">
                                            <Zap className="w-5 h-5 text-amber-500 mt-1" />
                                            <div>
                                                <p className="font-bold text-white">IA (OCR)</p>
                                                <p className="text-xs text-gray-400">Carga platos al menú escaneando fotos.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-900/40 rounded-lg border-l-4 border-amber-600 text-gray-300 italic text-sm">
                                    "Ahorra tiempo y gestiona tu negocio de forma inteligente con el Pase PRO."
                                </div>
                            </div>

                            <button
                                onClick={() => setIsPlansModalOpen(true)}
                                disabled={!resolvedLocalId}
                                className="w-full mt-10 inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition duration-200 shadow-lg disabled:opacity-50"
                            >
                                <Zap className="w-6 h-6 mr-3" />
                                Ver Planes Disponibles
                            </button>
                        </div>

                        {/* Card Lateral - Estilo Dashboard */}
                        <div className="space-y-6">
                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-gray-400" /> Ayuda
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Si tienes dudas sobre los pases o necesitas soporte técnico, puedes contactarnos a través de nuestros canales oficiales.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-600 to-amber-700 p-6 rounded-xl shadow-lg text-white">
                                <h3 className="text-xl font-bold mb-2">Pase Anual</h3>
                                <p className="text-amber-100/80 text-sm mb-4">
                                    Obtén todas las funciones durante un año completo con un descuento del 20%.
                                </p>
                                <div className="text-2xl font-black">$1.000.000 ARS</div>
                            </div>
                        </div>
                    </div>
                </div>

                <SubscriptionPlansModal
                    isOpen={isPlansModalOpen}
                    onClose={() => setIsPlansModalOpen(false)}
                    onPaymentInitiated={handlePaymentInitiated}
                    localId={resolvedLocalId}
                />
            </div>
        );
    }

    // --- Renderizado de Suscripción ACTIVA/CANCELLED ---

    const activeSubscription = subscription!;
    const isPlanActive = activeSubscription.status === 'active';
    const isPlanCancelled = activeSubscription.status === 'cancelled';
    const planName = activeSubscription.plan.includes('ANNUAL') ? 'Anual' : 'Mensual';
    const PlanIconComponent = Package;

    return (
        <div className="BGLocal min-h-screen text-white p-6 md:p-12"> {/* Se eliminó el fondo liso aquí */}
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl pt-12 font-bold mb-2 text-white">Mi Pase 🌟</h1>
                <p className="text-gray-400 mb-8">Gestión de su plan **DualEat Local {planName}**.</p>

                {/* Mensaje de Cancelación Activa - MODERNIZADO */}
                {isPlanCancelled && (
                    <div className="mb-10 relative group overflow-hidden rounded-2xl border border-red-500/30">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-900/20 to-transparent"></div>
                        <div className="relative p-6 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-sm">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                                    <XCircle className='w-8 h-8 text-red-500' />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white mb-1">
                                        Tu Pase PRO ha expirado
                                    </p>
                                    <p className="text-red-200/70 text-sm">
                                        El acceso premium finalizó el <span className='font-bold text-red-300'>{formatDate(activeSubscription.end_date)}</span>. Adquiere uno nuevo para recuperar tus beneficios.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPlansModalOpen(true)}
                                className="w-full md:w-auto bg-white text-gray-900 hover:bg-gray-200 font-black py-3 px-8 rounded-xl transition duration-300 shadow-xl shadow-red-900/40 uppercase tracking-tight"
                            >
                                Renovar Acceso PRO
                            </button>
                        </div>
                    </div>
                )}

                {/* Mensaje de Pago Pendiente/Otro Estado */}
                {(!isPlanActive && !isPlanCancelled && activeSubscription.status !== 'finished') && (
                    <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-xl flex justify-between items-center">
                        <p className="text-yellow-400 font-medium flex items-center">
                            <AlertCircle className='w-5 h-5 mr-3' />
                            Estado: **{getStatusLabel(activeSubscription.status)}**. Verifique su pago.
                        </p>
                        <button
                            onClick={() => setIsPlansModalOpen(true)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm"
                        >
                            Comprar Nuevo Plan
                        </button>
                    </div>
                )}

                {/* --- SECCIÓN 1: DETALLE DEL PLAN Y ESTADO --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

                    {/* Card de Información del Plan */}
                    <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                        <h2 className="text-2xl font-semibold mb-4 text-amber-400 flex items-center">
                            <PlanIconComponent className="w-6 h-6 mr-3 text-amber-500" />
                            Plan: {planName}
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center text-lg">
                                <span className="w-40 font-medium text-gray-400">Monto:</span>
                                <span className="font-bold text-white">{formatCurrency(activeSubscription.amount, activeSubscription.currency_id)}</span>
                            </div>

                            <div className="flex items-center text-lg">
                                <span className="w-40 font-medium text-gray-400">Inicia:</span>
                                <span className="text-white">{formatDate(activeSubscription.start_date)}</span>
                            </div>

                            <div className="flex items-center text-lg">
                                <span className="w-40 font-medium text-gray-400">{isPlanCancelled ? 'Finaliza:' : 'Próximo Pago:'}</span>
                                <span className={`font-bold ${isPlanActive ? 'text-green-400' : 'text-yellow-400'}`}>{formatDate(activeSubscription.end_date || activeSubscription.next_payment_date)}</span>
                            </div>
                        </div>
                    </div>


                </div>

                {/* --- SECCIÓN 2: HISTORIAL DE PAGOS --- */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-white flex items-center border-b border-gray-700 pb-2">
                        <Archive className="w-6 h-6 mr-3 text-gray-400" />
                        Historial de Pagos
                    </h2>

                    {historyData.length === 0 ? (
                        <p className="text-gray-400">No hay pagos registrados para este pase.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Monto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ref. MP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {historyData.map((payment, index) => (
                                        <tr key={index} className="hover:bg-gray-700 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(payment.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{formatCurrency(payment.amount, activeSubscription.currency_id)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'approved' ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'
                                                    }`}>
                                                    {payment.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-xs">{payment.reference_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Planes */}
            <SubscriptionPlansModal
                isOpen={isPlansModalOpen}
                onClose={() => setIsPlansModalOpen(false)}
                onPaymentInitiated={() => {
                    handlePaymentInitiated();
                    if (resolvedLocalId) loadSubscription(resolvedLocalId); // Forzar recarga después de iniciar pago
                }}
                localId={resolvedLocalId}
            />
        </div>
    );
};

export default LocalSubscription;