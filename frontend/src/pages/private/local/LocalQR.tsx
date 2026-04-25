/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useRef } from 'react';
import { Download, QrCode, AlertTriangle, HelpCircle, X } from 'lucide-react';
import { AuthContext } from '@context/auth/AuthContext';
import '@assets/scss/private/users/users.scss';
import React from 'react';

// ----------------------------------------------------------------------
// Interfaces de Datos
// ----------------------------------------------------------------------
interface QrResponse {
    qrCodeDataUrl: string;
    message: string;
}

interface Bounds {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface TourStep {
    id: number;
    title: string;
    text: string;
    selector: string;
    placement: 'right' | 'left' | 'top' | 'bottom';
}


// ----------------------------------------------------------------------
// Definición del Tour Manual
// ----------------------------------------------------------------------
const TOUR_STEPS: TourStep[] = [
    {
        id: 1,
        title: "Bienvenido al Panel QR",
        text: "Este panel es fundamental para conectar a sus clientes con su menú digital de forma instantánea y moderna.",
        selector: "#help-button",
        placement: "left",
    },
    {
        id: 2,
        title: "Función del QR",
        text: "Este código es único para su local. Al escanearlo, sus clientes acceden a su menú, registran su visita y pueden dejar una reseña.",
        selector: "#qr-card-title",
        placement: "bottom",
    },
    {
        id: 3,
        title: "Vista Previa del Código",
        text: "Aquí se muestra el QR generado. Es recomendable que lo imprima en papel, o en cartelería para colocarlo en las mesas, barras o donde más le convenga.",
        selector: "#qr-image-container",
        placement: "right",
    },
    {
        id: 4,
        title: "Descargar y Usar",
        text: "Descargue el código en formato PNG o JPG para usarlo en su local. Al ser un archivo vectorial, garantiza una alta calidad de impresión.",
        selector: "#download-buttons",
        placement: "top",
    },
];

const LocalQR = () => {
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [localId, setLocalId] = useState<number | null>(null);
    const [localName, setLocalName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ----------------------------------------------------------------------
    // Estados y Lógica del Tour Manual
    // ----------------------------------------------------------------------
    const [currentStep, setCurrentStep] = useState(0);
    const isTourOpen = currentStep > 0;

    const startTour = () => setCurrentStep(1);
    const closeTour = () => setCurrentStep(0);
    const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, TOUR_STEPS.length));
    const goToPrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    const activeStep = TOUR_STEPS.find(step => step.id === currentStep);
    // ----------------------------------------------------------------------

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const fetchUserLocal = async () => {
            if (!user) {
                setLoading(false);
                setError('Usuario no autenticado');
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/users/${user.id}/local`);
                if (!res.ok) throw new Error('No se pudo obtener el local para este usuario.');

                const data = await res.json();
                if (data?.id) {
                    setLocalId(data.id);
                    setLocalName(data.name);
                } else {
                    setError('No se encontró un local asociado a este usuario.');
                }
            } catch (err) {
                console.error(err);
                setError('Error al obtener el local del usuario.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserLocal();
    }, [user, API_BASE]);

    useEffect(() => {
        const fetchQrCode = async () => {
            if (!localId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE}/local/tools/qr/${localId}`);
                if (!response.ok) throw new Error('Error al cargar el código QR.');

                const data: QrResponse = await response.json();
                setQrDataUrl(data.qrCodeDataUrl);
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el código QR. Intente de nuevo.');
            } finally {
                setLoading(false);
            }
        };
        fetchQrCode();
    }, [localId, API_BASE]);

    const downloadQr = (format: 'png' | 'jpg') => {
        if (!qrDataUrl || !localName) {
            setError('No se pudo generar el nombre del archivo.');
            return;
        }
        const sanitizedLocalName = localName.trim().toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `menu_${sanitizedLocalName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ----------------------------------------------------------------------
    // Componente Modal Flotante del Tour
    // ----------------------------------------------------------------------
    const TourModal = () => {
        const [bounds, setBounds] = useState<Bounds | null>(null);
        const [isPositioned, setIsPositioned] = useState(false);
        const modalRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (!activeStep) return;

            const element = document.querySelector(activeStep.selector) as HTMLElement;
            if (!element) return;

            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const updateBoundsAndPosition = () => {
                const rect = element.getBoundingClientRect();

                const padding = 10;

                setBounds({
                    top: rect.top - padding,
                    left: rect.left - padding,
                    width: rect.width + 2 * padding,
                    height: rect.height + 2 * padding,
                });

                if (modalRef.current) {
                    let modalStyle: React.CSSProperties = { top: 0, left: 0 };

                    const OFFSET_DISTANCE = 25;
                    const MODAL_WIDTH = 320;
                    const MODAL_HEIGHT = 200; // Altura ajustada

                    switch (activeStep.placement) {
                        case 'right':
                            modalStyle.top = rect.top + (rect.height / 2) - (MODAL_HEIGHT / 2);
                            modalStyle.left = rect.left + rect.width + OFFSET_DISTANCE;
                            break;
                        case 'left':
                            modalStyle.top = rect.top + (rect.height / 2) - (MODAL_HEIGHT / 2);
                            modalStyle.left = rect.left - MODAL_WIDTH - OFFSET_DISTANCE;
                            break;
                        case 'top':
                            modalStyle.left = rect.left + (rect.width / 2) - (MODAL_WIDTH / 2);
                            modalStyle.top = rect.top - MODAL_HEIGHT - OFFSET_DISTANCE;
                            break;
                        case 'bottom':
                            modalStyle.left = rect.left + (rect.width / 2) - (MODAL_WIDTH / 2);
                            modalStyle.top = rect.top + rect.height + OFFSET_DISTANCE;
                            break;
                    }

                    // Ajuste de límites (para evitar que se salga de la pantalla)
                    if (modalStyle.left && (modalStyle.left as number) + MODAL_WIDTH > window.innerWidth - 20) {
                        modalStyle.left = window.innerWidth - MODAL_WIDTH - 20;
                    }
                    if (modalStyle.left && (modalStyle.left as number) < 20) {
                        modalStyle.left = 20;
                    }
                    if (modalStyle.top && (modalStyle.top as number) < 20) {
                        modalStyle.top = 20;
                    }
                    if (modalStyle.top && (modalStyle.top as number) + MODAL_HEIGHT > window.innerHeight - 20) {
                        modalStyle.top = window.innerHeight - MODAL_HEIGHT - 20;
                    }

                    // Aplicar estilos y marcar como posicionado
                    modalRef.current.style.top = `${modalStyle.top}px`;
                    modalRef.current.style.left = `${modalStyle.left}px`;
                    modalRef.current.style.transform = `none`;
                    setIsPositioned(true);
                }
            };

            const timeout = setTimeout(updateBoundsAndPosition, 350);

            updateBoundsAndPosition();
            window.addEventListener('resize', updateBoundsAndPosition);
            window.addEventListener('scroll', updateBoundsAndPosition);

            return () => {
                clearTimeout(timeout);
                window.removeEventListener('resize', updateBoundsAndPosition);
                window.removeEventListener('scroll', updateBoundsAndPosition);
                setIsPositioned(false);
            };
        }, [activeStep]);

        if (!isTourOpen || !activeStep || !bounds) return null;

        const totalSteps = TOUR_STEPS.length;
        const isFirst = activeStep.id === 1;
        const isLast = activeStep.id === totalSteps;


        return (
            // Contenedor principal con posicionamiento FIXED (estable al scroll)
            <div className="fixed inset-0 z-[1000] pointer-events-none">

                {/* Overlay Oscuro (Dividido en 4 partes para crear el "agujero") */}
                <div className="absolute inset-0 bg-transparent">
                    {/* Top Shade */}
                    <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
                        top: 0, left: 0, right: 0, height: bounds.top,
                    }}></div>
                    {/* Bottom Shade */}
                    <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
                        top: bounds.top + bounds.height, left: 0, right: 0, bottom: 0,
                    }}></div>
                    {/* Left Shade */}
                    <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
                        top: bounds.top, left: 0, width: bounds.left, height: bounds.height,
                    }}></div>
                    {/* Right Shade */}
                    <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
                        top: bounds.top, left: bounds.left + bounds.width, right: 0, height: bounds.height,
                    }}></div>
                </div>

                {/* Contenedor del modal (usando posición fija para que se quede en pantalla) */}
                <div
                    ref={modalRef}
                    className={`fixed z-[1001] w-80 p-0 rounded-xl shadow-2xl transition-opacity duration-200 ${isPositioned ? 'opacity-100' : 'opacity-0'}`}
                    style={{ pointerEvents: 'auto' }}
                >
                    <div className="bg-gray-800 p-4 rounded-xl border border-purple-600 shadow-xl relative">
                        {/* Botón de Cierre (Arriba a la derecha) */}
                        <button
                            onClick={closeTour}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
                            aria-label="Cerrar tutorial"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-purple-400 mb-2 border-b border-gray-700 pb-2 pr-8">
                            {activeStep.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                            {activeStep.text}
                        </p>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                            <div className="text-xs text-purple-400 font-medium">
                                Paso {currentStep} de {totalSteps}
                            </div>
                            <div className="flex space-x-2">
                                {/* Botón Anterior */}
                                {!isFirst && (
                                    <button
                                        onClick={goToPrevStep}
                                        className="px-3 py-1 text-sm rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                                    >
                                        Anterior
                                    </button>
                                )}

                                {/* Botón Siguiente / Finalizar */}
                                {!isLast ? (
                                    <button
                                        onClick={goToNextStep}
                                        className="px-3 py-1 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                                    >
                                        {isFirst ? 'Comenzar' : 'Siguiente'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={closeTour}
                                        className="px-3 py-1 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
                                    >
                                        Finalizar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    if (loading) {
        return <div className="text-center text-white p-8">Cargando código QR...</div>;
    }

    if (error) {
        return (
            <div className="text-center text-red-400 p-4 bg-gray-800 rounded-xl">
                <AlertTriangle className="inline mr-2" />
                {error}
            </div>
        );
    }

    if (!localId) {
        return <div className="text-center text-gray-400 p-8">No se encontró un local asociado.</div>;
    }

    return (
        <div className="BGLocal min-h-screen text-white p-4 md:p-6">

            {/* Componente Modal del Tour */}
            <TourModal />

            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold pt-12 text-white mb-2">Gestión de QR</h1>
                        <p className="text-gray-400">
                            Descarga y comparte tu código QR para que tus clientes accedan al menú.
                        </p>
                    </div>
                    {/* Botón de Ayuda "?" */}
                    <button
                        id="help-button"
                        onClick={isTourOpen ? closeTour : startTour}
                        className={`fixed top-20 right-6 z-[1002] p-3 rounded-full 
                                ${isTourOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white 
                                shadow-lg transition-transform duration-300 transform hover:scale-110`}
                        title={isTourOpen ? "Cerrar Tutorial" : "Mostrar Tutorial"}
                    >
                        {isTourOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                    </button>
                </header>

                <section className="bg-gray-800 rounded-xl p-6 md:p-8 shadow-lg border border-gray-700 mb-8 flex flex-col items-center text-center">
                    <QrCode className="w-16 h-16 text-blue-400 mb-4" />

                    <h3 className="text-2xl font-semibold text-white mb-2" id="qr-card-title">
                        Tu Código QR Personalizado
                    </h3>

                    <p className="text-gray-400 text-sm mb-6 max-w-lg">
                        Este código QR único enlaza directamente al menú digital de tu local.
                        Puedes imprimirlo para que tus clientes lo escaneen fácilmente.
                    </p>

                    <div className="bg-white p-4 rounded-xl shadow-inner mb-6" id="qr-image-container">
                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Código QR del menú" className="w-64 h-64 mx-auto" />
                        ) : (
                            <div className="w-64 h-64 flex items-center justify-center bg-gray-200 rounded-xl text-gray-500">
                                <p>Generando QR...</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4" id="download-buttons">
                        <button
                            onClick={() => downloadQr('png')}
                            disabled={!qrDataUrl}
                            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors 
                                            bg-gray-900 cursor-pointer hover:bg-gray-700 text-white 
                                            disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <Download size={20} />
                            <span>Descargar PNG</span>
                        </button>

                        <button
                            onClick={() => downloadQr('jpg')}
                            disabled={!qrDataUrl}
                            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors 
                                            bg-gray-900 cursor-pointer hover:bg-gray-700 text-white 
                                            disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <Download size={20} />
                            <span>Descargar JPG</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LocalQR;