/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
    XCircle, AlertCircle, Zap, Archive,
    DollarSign, Package, Loader2, CheckCircle,
} from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import SubscriptionPlansModal from '../../components/locals/SubscriptionPlansModal';

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
    const response = await fetch(`${API_BASE}/subscriptions/local/${localId}`, {
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

const toggleAutoRenewStatus = async (localId: string, autoRenew: boolean): Promise<SubscriptionData> => {
    // ... (Implementación de la API)
    const response = await fetch(`${API_BASE}/subscriptions/local/toggle-renew`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localId, autoRenew })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido al cambiar la renovación.');
    }
    const data = await response.json();
    return data.subscription as SubscriptionData;
};


// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------

const LocalSubscription: React.FC = () => {
    const authContext = useContext(AuthContext);

    const userId = authContext?.user?.id;
    const localIdFromContext = authContext?.user?.local_users?.[0]?.local_id;

    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
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

    // Maneja la desactivación/activación de auto_renew
    const handleToggleAutoRenew = async () => {
        if (!subscription || !resolvedLocalId) return;

        const newAutoRenewStatus = !subscription.auto_renew;

        setActionLoading(true);
        setError(null);

        try {
            // Llama a la API (el backend debe retornar el objeto actualizado)
            await toggleAutoRenewStatus(resolvedLocalId, newAutoRenewStatus);

            // **CORRECCIÓN DE BUG:** Forzar recarga del estado desde la DB
            await loadSubscription(resolvedLocalId);

        } catch (e: any) {
            setError(e.message || "No se pudo actualizar la renovación automática.");
        } finally {
            setActionLoading(false);
        }
    };

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
        <div className="flex items-center justify-center p-8 min-h-screen bg-gray-900/50">
            <div className="text-center bg-gray-800 p-6 rounded-xl shadow-lg">
                <Loader2 className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-400">Cargando datos de suscripción...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-white min-h-screen bg-gray-900/50">
            <h1 className="text-3xl pt-12 font-bold mb-6">Mi Suscripción</h1>
            <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg border border-red-700 text-red-400">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="font-semibold text-lg mb-2">Error Crítico</p>
                <p>{error}</p>
            </div>
        </div>
    );


    if (requiresNewPurchase) {
        return (
            <div className="text-white p-6 md:p-12"> {/* Se eliminó el fondo liso aquí */}
                <h1 className="text-4xl pt-12 font-bold mb-6 text-white">Mi Suscripción 💳</h1>
                <p className="text-gray-400 mb-10">Potencia tu local con herramientas avanzadas suscribiéndote a DualEat PRO.</p>

                {/* --- SECCIÓN MEJORADA: NO TIENE SUSCRIPCIÓN ACTIVA --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Panel de Estado Principal */}
                    <div className="lg:col-span-2 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                        <DollarSign className="w-10 h-10 mb-4 text-amber-500" />
                        <h2 className="text-3xl font-bold mb-3 text-white">
                            Suscripción Inactiva
                        </h2>

                        {resolvedLocalId ? (
                            <div className="text-lg text-gray-300 mb-6 space-y-4">
                                <p>
                                    Su local **no tiene una suscripción activa** o la existente ha finalizado.
                                </p>
                                <p>
                                    ¡No te preocupes! Aún tienes acceso gratuito a las funciones esenciales: <span className="text-white font-medium">cargar y editar tu menú, revisar tus reseñas y modificar la configuración de tu local.</span>
                                </p>
                                <p>
                                    <span className="text-amber-400 font-medium">Activa el plan mensual</span> para desbloquear el Dashboard de estadísticas, el calendario organizador y la carga de fotos del menú con detección automática por IA (OCR).
                                </p>
                            </div>
                        ) : (
                            <p className="text-lg text-red-300 mb-6">
                                ¡No se pudo vincular un Local! Por favor, asegúrese de que su cuenta de usuario esté correctamente asociada a un Local.
                            </p>
                        )}

                        <button
                            onClick={() => setIsPlansModalOpen(true)}
                            disabled={!resolvedLocalId}
                            className="w-full md:w-auto mt-4 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-gray-900 font-extrabold py-3 px-8 rounded-lg text-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Zap className="w-5 h-5 mr-3" />
                            Ver Plan Mensual
                        </button>
                    </div>

                    {/* Card de Beneficios/Preview (Manteniendo el diseño) */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 flex flex-col justify-between">
                        <h3 className="text-xl font-semibold mb-4 text-amber-400 flex items-center">
                            <Zap className="w-5 h-5 mr-2" /> Beneficios Pro
                        </h3>
                        <ul className="space-y-3 text-gray-300 text-sm">
                            <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" /> Dashboard completo con estadísticas del local.</li>
                            <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" /> Carga rápida de menú con detección de IA (OCR).</li>
                            <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" /> Calendario interactivo de organización.</li>
                            <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" /> Soporte prioritario.</li>
                        </ul>
                        <div className="mt-6 border-t border-gray-700 pt-4">
                            <p className="text-sm text-gray-500">
                                Plan único mensual, flexible y sin permanencia forzosa.
                            </p>
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
        <div className="text-white p-6 md:p-12"> {/* Se eliminó el fondo liso aquí */}
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl pt-12 font-bold mb-2 text-white">Mi Suscripción 🌟</h1>
                <p className="text-gray-400 mb-8">Gestión de su plan **DualEat Local {planName}**.</p>

                {/* Mensaje de Cancelación Activa */}
                {isPlanCancelled && (
                    <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-xl flex justify-between items-center">
                        <p className="text-red-300 font-medium flex items-center">
                            <XCircle className='w-5 h-5 mr-3' />
                            **Suscripción Cancelada.** Su acceso continuará hasta: <span className='font-bold ml-1'>{formatDate(activeSubscription.end_date)}.</span> ¡Puede reactivar la auto-renovación en cualquier momento!
                        </p>
                        <button
                            onClick={handleToggleAutoRenew}
                            disabled={actionLoading}
                            className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {actionLoading ? 'Activando...' : 'Reactivar Plan'}
                        </button>
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
                        <p className="text-gray-400">No hay pagos registrados para esta suscripción.</p>
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