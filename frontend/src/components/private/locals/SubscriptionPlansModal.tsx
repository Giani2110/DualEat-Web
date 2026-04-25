import React, { useContext, useState } from 'react';
import { Zap, Clock, CheckCircle, Send, X, AlertCircle, Loader2 } from 'lucide-react';
import { AuthContext } from '@context/auth/AuthContext';

interface Plan {
    id: 'LOCAL_MONTHLY' | 'LOCAL_ANNUAL';
    name: string;
    price: number;
    displayPrice: string;
    duration: string;
    features: string[];
    color: string;
    discount?: string;
}

interface SubscriptionPlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentInitiated: () => void;
    localId: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const plans: Plan[] = [
    {
        id: 'LOCAL_MONTHLY',
        name: 'Pase Mensual PRO',
        price: 100000,
        displayPrice: '$100.000 ARS',
        duration: '1 Mes de Acceso',
        features: [
            'Dashboard de estadísticas básico',
            'Calendario organizativo',
            'Carga de menú por IA (OCR)',
            'Soporte estándar'
        ],
        color: 'border-amber-500/30',
    },
    {
        id: 'LOCAL_ANNUAL',
        name: 'Pase Anual ELITE',
        price: 1000000,
        displayPrice: '$1.000.000 ARS',
        duration: '12 Meses Full',
        features: [
            'Todo lo del plan Mensual',
            'Soporte Prioritario 24/7',
            '¡Ahorras 2 meses completos!'
        ],
        color: 'border-yellow-500',
        discount: 'MÁS POPULAR'
    }
];

const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({ isOpen, onClose, onPaymentInitiated, localId }) => {
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // Función para iniciar el checkout
    const handleCheckout = async () => {
        if (!selectedPlan || !user || !localId) {
            setError('Error interno: Faltan datos del usuario o del local.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/subscription/local-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    payerEmail: user.email,
                    localId: localId,
                    plan: selectedPlan.id,
                }),
            });

            const data = await response.json();

            if (response.ok && data.checkoutUrl) {
                onPaymentInitiated();
                window.location.href = data.checkoutUrl;
            } else {
                setError(data.message || 'Error al generar la URL de pago.');
            }
        } catch (e: any) {
            setError(e.message || 'Error de conexión al procesar el pago.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300">
            <div className="relative bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 border border-gray-700 transform transition-transform duration-300 scale-100">

                {/* Botón de cierre */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                    aria-label="Cerrar ventana de planes"
                >
                    <X className="w-6 h-6" />
                </button>

                <h1 className="text-3xl font-bold mb-2 text-amber-400 border-b border-gray-700 pb-3 pr-10">Conviértete en PRO</h1>
                <p className="text-gray-400 mb-8">Desbloquea herramientas exclusivas para potenciar tu local.</p>

                {error && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded-lg mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan)}
                            className={`relative bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col
                                border-4 ${plan.id === selectedPlan?.id ? plan.color : 'border-gray-700 hover:border-gray-600'}`
                            }
                        >

                            {/* Etiqueta de Descuento (Solo para Plan Anual) */}
                            {plan.discount && (
                                <span className="absolute top-0 right-0 bg-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl z-10">
                                    ¡AHORRA!
                                </span>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1 text-white">{plan.name}</h2>
                                    <p className="text-sm font-medium text-gray-400 flex items-center">
                                        <Clock className="w-4 h-4 mr-1" /> {plan.duration}
                                    </p>
                                </div>
                                <Zap className={`w-6 h-6 ${plan.id === 'LOCAL_ANNUAL' ? 'text-amber-500' : 'text-blue-400'}`} />
                            </div>

                            <div className="mb-6">
                                <p className="text-4xl font-black text-white">
                                    {plan.displayPrice}
                                </p>
                                <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">Pago único manual</p>
                            </div>

                            <ul className="space-y-2 mb-6 text-gray-300 text-sm flex-grow">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* Botón de Compra */}
                            <button
                                onClick={handleCheckout}
                                disabled={plan.id !== selectedPlan?.id || loading || !user}
                                className={`w-full py-3 rounded-lg font-bold transition duration-300 text-base flex items-center justify-center mt-auto
                                    ${plan.id === selectedPlan?.id
                                        ? 'bg-amber-500 hover:bg-amber-600 text-gray-900' // Botón seleccionado con color Amber/Gold
                                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                    }
                                    ${(loading || !user) && 'opacity-50 cursor-not-allowed'}
                                `}
                            >
                                {loading && plan.id === selectedPlan?.id ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                        Iniciando...
                                    </>
                                ) : (
                                    <>
                                        {plan.id === 'LOCAL_ANNUAL' ? <Zap className="w-5 h-5 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                        Adquirir {plan.name.split(' ')[1]}
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlansModal;