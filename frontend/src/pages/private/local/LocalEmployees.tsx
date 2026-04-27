import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@context/auth/AuthContext';
import {
    Users,
    UserPlus,
    Trash2,
    Mail,
    User,
    Shield,
    AlertCircle,
    CheckCircle,
    X,
    Lock,
    Loader2,
    HelpCircle
} from 'lucide-react';
import ConfirmModal from '@/components/modal/ConfirmModal';

interface Employee {
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar_url: string | null;
        role: string;
    };
}

// ----------------------------------------------------------------------
// Interfaces y Definición del Tour
// ----------------------------------------------------------------------
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

const TOUR_STEPS: TourStep[] = [
    {
        id: 1,
        title: "Gestión de Empleados",
        text: "Desde aquí puedes administrar a tu equipo. Los empleados que agregues podrán tomar pedidos, atender mesas y gestionar el flujo de tu local.",
        selector: "#help-button",
        placement: "left",
    },
    {
        id: 2,
        title: "Agregar Nuevo Personal",
        text: "Haz clic aquí para sumar un nuevo mozo o administrador. Solo necesitas su correo electrónico.",
        selector: "#add-employee-button",
        placement: "bottom",
    },
    {
        id: 3,
        title: "Lista de Personal",
        text: "Aquí verás a todos tus empleados actuales, su rol y la fecha en que se unieron a tu equipo.",
        selector: "#employee-list-container",
        placement: "top",
    },
    {
        id: 4,
        title: "Roles y Permisos",
        text: "Existen dos roles: 'Staff' (ideal para mozos) y 'Administrador' (para encargados con permisos totales).",
        selector: "#employee-role-badge",
        placement: "right",
    },
];

const LocalEmployees = () => {
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [localId, setLocalId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Tour state
    const [currentStep, setCurrentStep] = useState(0);
    const isTourOpen = currentStep > 0;

    const startTour = () => setCurrentStep(1);
    const closeTour = () => setCurrentStep(0);
    const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, TOUR_STEPS.length));
    const goToPrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    const activeStep = TOUR_STEPS.find(step => step.id === currentStep);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addStep, setAddStep] = useState(1); // 1: Email, 2: New User Details
    // ... (omitted lines until rest of implementation)

    // Form states
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        userId: string | null;
        userName: string;
    }>({
        isOpen: false,
        userId: null,
        userName: '',
    });

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const fetchLocalAndEmployees = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                // Get local associated with user
                const localRes = await fetch(`${API_BASE}/users/${user.id}/local`);
                const localData = await localRes.json();

                if (localData?.id) {
                    setLocalId(localData.id);
                    fetchEmployees(localData.id);
                } else {
                    setError('No se encontró un local asociado.');
                    setLoading(false);
                }
            } catch (err) {
                setError('Error al conectar con el servidor.');
                setLoading(false);
            }
        };

        fetchLocalAndEmployees();
    }, [user?.id]);

    const fetchEmployees = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/local/employees/${id}`);
            const data = await res.json();
            if (data.success) {
                setEmployees(data.data);
            } else {
                setError(data.message || 'Error al obtener empleados.');
            }
        } catch (err) {
            setError('Error al cargar la lista de empleados.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`${API_BASE}/local/employees/${localId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, password }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Empleado añadido correctamente.');
                fetchEmployees(localId!);
                resetForm();
            } else {
                const errorMsg = data.message?.toLowerCase() || '';
                if (errorMsg.includes('se requiere nombre y contraseña')) {
                    setAddStep(2);
                } else {
                    setError(data.message || 'Ocurrió un error inesperado.');
                }
            }
        } catch (err) {
            setError('Error de red al intentar añadir empleado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEmployee = async () => {
        if (!localId || !deleteConfirm.userId) return;

        try {
            const res = await fetch(`${API_BASE}/local/employees/${localId}/${deleteConfirm.userId}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                setSuccess('Empleado eliminado correctamente.');
                fetchEmployees(localId);
            } else {
                setError(data.message || 'No se pudo eliminar el empleado.');
            }
        } catch (err) {
            setError('Error de red al intentar eliminar empleado.');
        } finally {
            setDeleteConfirm({ isOpen: false, userId: null, userName: '' });
        }
    };

    const resetForm = () => {
        setEmail('');
        setName('');
        setPassword('');
        setAddStep(1);
        setShowAddModal(false);
        setError(null);
    };

    // ----------------------------------------------------------------------
    // Componente Modal Flotante del Tour
    // ----------------------------------------------------------------------
    const TourModal = () => {
        const [bounds, setBounds] = useState<Bounds | null>(null);
        const [isPositioned, setIsPositioned] = useState(false);
        const modalRef = React.useRef<HTMLDivElement>(null);

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
                    const MODAL_HEIGHT = 180;

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
        }, [isTourOpen, activeStep]);

        if (!isTourOpen || !activeStep || !bounds) return null;

        const totalSteps = TOUR_STEPS.length;
        const isFirst = activeStep.id === 1;
        const isLast = activeStep.id === totalSteps;

        return (
            <div className="fixed inset-0 z-[1000] pointer-events-none">
                <div className="absolute inset-0 bg-transparent">
                    <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{ top: 0, left: 0, right: 0, height: bounds.top }}></div>
                    <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{ top: bounds.top + bounds.height, left: 0, right: 0, bottom: 0 }}></div>
                    <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{ top: bounds.top, left: 0, width: bounds.left, height: bounds.height }}></div>
                    <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{ top: bounds.top, left: bounds.left + bounds.width, right: 0, height: bounds.height }}></div>
                </div>

                <div
                    ref={modalRef}
                    className={`fixed z-[1001] w-80 p-0 rounded-xl shadow-2xl transition-opacity duration-200 ${isPositioned ? 'opacity-100' : 'opacity-0'}`}
                    style={{ pointerEvents: 'auto' }}
                >
                    <div className="bg-gray-800 p-4 rounded-xl border border-red-600 shadow-xl relative">
                        <button onClick={closeTour} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-red-400 mb-2 border-b border-gray-700 pb-2 pr-8">{activeStep.title}</h3>
                        <p className="text-gray-300 text-sm mb-4">{activeStep.text}</p>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                            <div className="text-xs text-red-400 font-medium">Paso {currentStep} de {totalSteps}</div>
                            <div className="flex space-x-2">
                                {!isFirst && (
                                    <button onClick={goToPrevStep} className="px-3 py-1 text-sm rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors">Anterior</button>
                                )}
                                {!isLast ? (
                                    <button onClick={goToNextStep} className="px-3 py-1 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">{isFirst ? 'Comenzar' : 'Siguiente'}</button>
                                ) : (
                                    <button onClick={closeTour} className="px-3 py-1 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Finalizar</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen BGLocal p-4 pt-12 sm:p-8 sm:pt-24 relative">
            <TourModal />

            {/* Help Button "?" */}
            <button
                id="help-button"
                onClick={isTourOpen ? closeTour : startTour}
                className={`fixed top-24 right-6 z-[1002] p-3 rounded-full 
                             ${isTourOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white 
                             shadow-lg transition-transform duration-300 transform hover:scale-110 cursor-pointer`}
                title={isTourOpen ? "Cerrar Tutorial" : "Mostrar Tutorial"}
            >
                {isTourOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
            </button>

            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/40 p-6 rounded-3xl border border-gray-800 backdrop-blur-md shadow-xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
                            <Users className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Gestionar Empleados</h1>
                            <p className="text-gray-400 text-sm">Administra quiénes tienen acceso a tu local</p>
                        </div>
                    </div>
                    <button
                        id="add-employee-button"
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg shadow-red-900/20 cursor-pointer"
                    >
                        <UserPlus size={20} />
                        <span>Agregar Empleado</span>
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 flex items-center space-x-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-300 flex items-center space-x-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{success}</p>
                    </div>
                )}

                {/* Employee List */}
                <div id="employee-list-container" className="bg-gray-900/40 rounded-3xl border border-gray-800 backdrop-blur-md shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-800/30">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Empleado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Unido el</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {employees.length > 0 ? (
                                    employees.map((employee, index) => (
                                        <tr key={employee.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 overflow-hidden">
                                                        {employee.user.avatar_url ? (
                                                            <img src={employee.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="text-gray-500 w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{employee.user.name}</p>
                                                        <p className="text-gray-500 text-sm">{employee.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    id={index === 0 ? "employee-role-badge" : undefined}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${employee.role === 'admin'
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                        }`}>
                                                    <Shield size={12} className="mr-1" />
                                                    {employee.role === 'admin' ? 'Administrador' : 'Staff'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(employee.joined_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {user?.id !== employee.user_id && (
                                                    <button
                                                        onClick={() => setDeleteConfirm({
                                                            isOpen: true,
                                                            userId: employee.user_id,
                                                            userName: employee.user.name
                                                        })}
                                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                {user?.id === employee.user_id && (
                                                    <span className="text-xs text-gray-600 italic">Eres tú</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No hay empleados registrados todavía.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 rounded-3xl border border-gray-800 w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <UserPlus size={22} className="text-red-500" />
                                {addStep === 1 ? 'Agregar Empleado' : 'Nuevo Usuario'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddEmployee} className="p-6 space-y-5">

                            {addStep === 1 ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-300 ml-1">Email del empleado</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="ejemplo@correo.com"
                                                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 ml-1">
                                            Si el usuario ya tiene cuenta, se asignará directamente.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4">
                                        <p className="text-xs text-red-300">
                                            Este correo no está registrado en DualEat. Completa los datos para crearle una cuenta.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-300 ml-1">Nombre Completo</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Nombre completo"
                                                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-300 ml-1">Contraseña Temporal</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Contraseña o DNI"
                                                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 ml-1">
                                            El empleado podrá cambiarla al iniciar sesión.
                                        </p>
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        addStep === 1 ? 'Verificar y Agregar' : 'Crear y Asignar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                title="Quitar Empleado"
                message={`¿Estás seguro que deseas quitar a "${deleteConfirm.userName}" de tu local? No tendrá más acceso al panel de administración.`}
                onConfirm={handleDeleteEmployee}
                onClose={() => setDeleteConfirm({ isOpen: false, userId: null, userName: '' })}
                confirmText="Quitar Acceso"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    );
};

export default LocalEmployees;
