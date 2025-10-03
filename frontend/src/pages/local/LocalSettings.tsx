import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/auth/AuthContext'; 
import { AlertCircle, Save, Clock, MapPin, Image, Upload, Trash, Tag, CheckCircle, Store, Phone, Mail, X, Plus, ChevronDown } from 'lucide-react';

type DayOfWeek = "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";

interface ScheduleItem {
    day_of_week: DayOfWeek;
    open_time: string;
    close_time: string;
}

interface Local {
    id: string; 
    name: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    image_url: string | null;
    categorias_menu: string[] | null;
}

interface LocalSettingsData {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    image_url: string | null;
    categorias_menu: string[]; 
}

interface AuthUser {
    id: string;
}

interface AuthContextType {
    user: AuthUser | null;
}

const DAY_MAP: Record<DayOfWeek, string> = {
    LUNES: 'Lunes',
    MARTES: 'Martes',
    MIERCOLES: 'Miércoles',
    JUEVES: 'Jueves',
    VIERNES: 'Viernes',
    SABADO: 'Sábado',
    DOMINGO: 'Domingo',
};
const ALL_DAYS: DayOfWeek[] = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

interface TimeInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({ label, value, onChange, disabled }) => (
    <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide">{label}</label>
        <input
            type="time"
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 transition-all backdrop-blur-sm"
        />
    </div>
);

const SuccessAlert: React.FC<{ message: string }> = ({ message }) => (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-300 border border-green-500/20 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
            </div>
            <p className="font-medium">{message}</p>
        </div>
    </div>
);

const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-300 border border-red-500/20 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
            </div>
            <p className="font-medium">{message}</p>
        </div>
    </div>
);

const InputField = ({ id, name, label, value, onChange, type = 'text', required = false, placeholder = '', icon, disabled = false }: any) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-gray-700/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm`}
        />
      </div>
    </div>
);

const TextareaField = ({ id, name, label, value, onChange, placeholder = '', disabled = false }: any) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-300">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value || ''}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-gray-700/70 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
      ></textarea>
    </div>
);

interface AccordionSectionProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    summary?: string;
    disabled?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, icon, color, isOpen, onToggle, children, summary, disabled }) => (
    <div className={`bg-gradient-to-br from-gray-800/80 to-gray-800/50 rounded-2xl shadow-2xl border transition-all duration-300 backdrop-blur-sm ${
        isOpen ? 'border-gray-600/50 shadow-xl' : 'border-gray-700/30 hover:border-gray-600/50'
    }`}>
        <button
            type="button"
            className={`w-full p-6 flex justify-between items-center transition-all duration-300 rounded-2xl ${
                isOpen ? 'bg-gray-700/40 rounded-b-none' : 'hover:bg-gray-700/20'
            }`}
            onClick={onToggle}
            disabled={disabled}
        >
            <div className="flex items-center space-x-4">
                <div className={`w-11 h-11 ${color} bg-gray-700/50 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
                    {icon}
                </div>
                <div className="text-left">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    {summary && !isOpen && (
                        <p className="text-sm text-gray-400 mt-0.5">{summary}</p>
                    )}
                </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>

        <div 
            className={`transition-all duration-300 overflow-hidden ${
                isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
            <div className={`${isOpen ? 'block p-6 pt-4' : 'hidden'}`}>
                {children}
            </div>
        </div>
    </div>
);

interface ScheduleManagerProps {
    schedules: ScheduleItem[];
    setSchedules: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
    handleScheduleChange: (day: DayOfWeek, field: 'open_time' | 'close_time', value: string) => void;
    isUpdatingAny: boolean;
    isOpen: boolean; 
    onToggle: () => void; 
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
    schedules,
    setSchedules,
    handleScheduleChange,
    isUpdatingAny,
    isOpen,
    onToggle,
}) => {
    
    const [openDay, setOpenDay] = useState<DayOfWeek | null>(null);

    const getScheduleForDay = (day: DayOfWeek): ScheduleItem | undefined => {
        return schedules.find(s => s.day_of_week === day);
    };

    const toggleDay = (day: DayOfWeek) => {
        if (getScheduleForDay(day)) {
            setSchedules(prev => prev.filter(s => s.day_of_week !== day));
            if (openDay === day) setOpenDay(null);
        } else {
            const defaultSchedule: ScheduleItem = {
                day_of_week: day,
                open_time: '09:00',
                close_time: '18:00',
            };
            setSchedules(prev => {
                const newSchedules = [...prev, defaultSchedule];
                return newSchedules.sort((a, b) => ALL_DAYS.indexOf(a.day_of_week) - ALL_DAYS.indexOf(b.day_of_week));
            });
            setOpenDay(day);
        }
    };
    
    const toggleDropdown = (day: DayOfWeek) => {
        if (getScheduleForDay(day)) {
             setOpenDay(openDay === day ? null : day);
        }
    }
    
    const activeDaysCount = schedules.length;
    const scheduleSummary = activeDaysCount > 0 ? 
        `${activeDaysCount} ${activeDaysCount === 1 ? 'día activo' : 'días activos'}` : 
        'Local cerrado todos los días';

    return (
        <AccordionSection
            title="Horarios Semanales"
            icon={<Clock className="w-full h-full" />}
            color="text-yellow-400"
            isOpen={isOpen}
            onToggle={onToggle}
            summary={scheduleSummary}
            disabled={isUpdatingAny}
        >
            <div className="space-y-3">
                {ALL_DAYS.map((day) => {
                    const currentSchedule = getScheduleForDay(day);
                    const isActive = !!currentSchedule;
                    const isDayOpen = openDay === day;
                    
                    const dayScheduleSummary = isActive ? `${currentSchedule!.open_time} - ${currentSchedule!.close_time}` : 'Cerrado';

                    return (
                        <div key={day} className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                            isActive ? 'border-gray-600/50 bg-gray-700/20' : 'border-gray-700/30'
                        }`}>
                            <div 
                                className={`flex items-center justify-between p-4 transition-colors cursor-pointer ${
                                    isActive ? 'hover:bg-gray-700/30' : 'hover:bg-gray-700/10'
                                }`}
                                onClick={() => toggleDropdown(day)}
                            >
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleDay(day); }}
                                        disabled={isUpdatingAny}
                                        title={isActive ? "Desactivar Día" : "Activar Día"}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all disabled:opacity-50 shadow-lg ${
                                            isActive 
                                                ? 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white' 
                                                : 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                                        }`}
                                    >
                                        {isActive ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </button>
                                    <span className="font-semibold text-white">{DAY_MAP[day]}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
                                        isActive 
                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                                            : 'text-gray-500 italic'
                                    }`}>
                                        {dayScheduleSummary}
                                    </span>
                                    {isActive && (
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDayOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    )}
                                </div>
                            </div>

                            {isActive && isDayOpen && currentSchedule && (
                                <div className="p-5 bg-gray-700/20 border-t border-gray-700/30 grid grid-cols-2 gap-4">
                                    <TimeInput
                                        label="Hora de Apertura"
                                        value={currentSchedule.open_time}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScheduleChange(day, 'open_time', e.target.value)}
                                        disabled={isUpdatingAny}
                                    />
                                    <TimeInput
                                        label="Hora de Cierre"
                                        value={currentSchedule.close_time}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScheduleChange(day, 'close_time', e.target.value)}
                                        disabled={isUpdatingAny}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </AccordionSection>
    );
};

const LocalSettings = () => {
    const authContext = useContext(AuthContext) as AuthContextType;
    const user = authContext?.user; 
    
    const [localId, setLocalId] = useState<string | null>(null);
    const [local, setLocal] = useState<LocalSettingsData | null>(null);
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]); 
    
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [openSection, setOpenSection] = useState<'general' | 'image' | 'schedule' | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const toggleSection = (section: 'general' | 'image' | 'schedule') => {
        setOpenSection(openSection === section ? null : section);
    };
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const uploadImage = async (file: File) => {
        if (!localId) {
            setError('Error: El ID del local no está disponible.');
            return;
        }
        
        setIsUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`${API_BASE}/settings/upload-local-image/${localId}`, { 
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error ${res.status}: Falló la subida de imagen.`);
            }

            const data = await res.json();
            setLocal(prev => prev ? { ...prev, image_url: data.url } : null);
            setSuccessMessage('Imagen subida con éxito. ¡No olvides guardar la configuración!');

        } catch (err: any) {
            console.error('Error al subir la imagen:', err);
            setError(`Error al subir imagen: ${err.message}`);
        } finally {
            setIsUploading(false);
            setTimeout(() => setError(null), 7000);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadImage(file);
            e.target.value = '';
        }
    };
    
    const handleRemoveImage = () => {
        setShowDeleteModal(true);
    };

    const confirmRemoveImage = () => {
        if (local) {
          setLocal({ ...local, image_url: '' });
          setSuccessMessage('Imagen eliminada. ¡Recordá guardar la configuración para confirmar!');
          setShowDeleteModal(false);
        }
    };

    const cancelRemoveImage = () => {
        setShowDeleteModal(false);
    };

    useEffect(() => {
        const fetchUserLocal = async () => {
          if (!user?.id) {
            setLoading(false);
            setError('Error: Usuario no autenticado.');
            return;
          }
          setLoading(true);
          setError(null);
          try {
            const res = await fetch(`${API_BASE}/users/${user.id}/local`);
            const data = await res.json();
            if (data?.id) {
              setLocalId(data.id);
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
        const fetchLocalSettings = async () => {
            if (!localId) return;
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            try {
                const localRes = await fetch(`${API_BASE}/settings/${localId}`); 

                if (!localRes.ok) {
                    let errorMessage = `Error ${localRes.status}: No se pudo cargar la configuración general.`;
                    try {
                        const errorData = await localRes.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (parseError) { }
                    throw new Error(errorMessage);
                }
          
                const localData: Local = await localRes.json();

                setLocal({
                    id: localData.id, 
                    name: localData.name,
                    description: localData.description ?? '',
                    address: localData.address ?? '',
                    phone: localData.phone ?? '',
                    email: localData.email ?? '',
                    image_url: localData.image_url,
                    categorias_menu: localData.categorias_menu ?? [],
                });
                
                const scheduleRes = await fetch(`${API_BASE}/settings/${localId}/schedule`);
                if (scheduleRes.ok) {
                    const schedulesData: ScheduleItem[] = await scheduleRes.json();
                    setSchedules(schedulesData); 
                } else {
                    setSchedules([]);
                }

            } catch (err: any) {
                console.error("Error de carga:", err);
                setError(err.message || 'Error al cargar los datos del local.'); 
            } finally {
                setLoading(false);
            }
        };
        fetchLocalSettings();
    }, [localId, API_BASE]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocal(prev => prev ? { ...prev, [name]: value } : null);
    };
    
    const handleScheduleChange = (day: DayOfWeek, field: 'open_time' | 'close_time', value: string) => {
        setSchedules(prevSchedules => {
            const existingSchedule = prevSchedules.find(s => s.day_of_week === day);
            if (existingSchedule) {
                return prevSchedules.map(s => 
                    s.day_of_week === day ? { ...s, [field]: value } : s
                );
            } else {
                const newSchedule: ScheduleItem = {
                    day_of_week: day,
                    open_time: field === 'open_time' ? value : '00:00',
                    close_time: field === 'close_time' ? value : '00:00',
                };
                const updated = prevSchedules.filter(s => s.day_of_week !== day);
                updated.push(newSchedule);
                return updated.sort((a, b) => ALL_DAYS.indexOf(a.day_of_week) - ALL_DAYS.indexOf(b.day_of_week));
            }
        });
    };

    const updateLocalGeneralSettings = async () => {
        const dataToSend = {
            name: local!.name, description: local!.description, address: local!.address,
            phone: local!.phone, email: local!.email, image_url: local!.image_url,
            categorias_menu: local!.categorias_menu,
        };
        try {
            const res = await fetch(`${API_BASE}/settings/${local!.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend) });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Error ${res.status}: Falló la actualización general.`);
            }
            return res.json();
        } catch (err: any) {
            throw new Error(`Error en Configuración General: ${err.message}`); 
        }
    };
    
    const updateLocalSchedule = async () => {
        const validSchedules = schedules.filter(s => s.open_time && s.close_time);
        try {
            const res = await fetch(`${API_BASE}/settings/${localId}/schedule`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validSchedules) });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Error ${res.status}: Falló la actualización de horarios.`);
            }
            const updatedSchedulesResponse = await res.json();
            if (updatedSchedulesResponse.schedules) {
                setSchedules(updatedSchedulesResponse.schedules);
            } else {
                setSchedules(validSchedules);
            }
            return updatedSchedulesResponse;
        } catch (err: any) {
            throw new Error(`Error en Horarios: ${err.message}`);
        }
    };
    
    const handleUnifiedSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!local || !local.id || isUpdatingAny) return; 
        
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);

        const localUpdatePromise = updateLocalGeneralSettings();
        const scheduleUpdatePromise = updateLocalSchedule();
        try {
            await Promise.all([localUpdatePromise, scheduleUpdatePromise]);
            setSuccessMessage('¡Configuración completa del local actualizada con éxito!');
        } catch (err: any) {
            console.error('Error en el guardado unificado:', err);
            setError(err.message || 'Error desconocido al intentar guardar toda la configuración.');
        } finally {
            setIsUpdating(false);
            setTimeout(() => setSuccessMessage(null), 5000);
            setTimeout(() => setError(null), 7000);
        }
    };

    const isUpdatingAny = isUpdating || isUploading;
    
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-300 font-medium">Cargando configuración...</p>
          </div>
        </div>
    );

    if (error && !local) return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center p-8 bg-gradient-to-br from-gray-800/80 to-gray-800/50 rounded-2xl shadow-2xl border border-red-700/30 text-red-400 backdrop-blur-sm max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="font-bold text-xl mb-2">Error al cargar la configuración</p>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
    );
    
    if (!local) return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-gray-400 font-medium">No se encontraron datos del local</p>
        </div>
    );

    return (
        <div className="min-h-screen text-white">
            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">¿Eliminar imagen?</h3>
                        </div>
                        <p className="text-gray-300 mb-6">
                            Esta acción quitará la imagen actual del local. Deberás guardar la configuración para confirmar los cambios.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelRemoveImage}
                                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmRemoveImage}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="pt-12 pb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Ajustes del Local</h1>
                        <p className="text-gray-400">Personaliza la información y configuración de tu negocio</p>
                    </div>

                    {/* Mensajes de Estado */}
                    {successMessage && <SuccessAlert message={successMessage} />}
                    {error && <ErrorAlert message={error} />}

                    <form onSubmit={handleUnifiedSubmit} className="space-y-5">
                        
                        {/* ACORDEÓN 1: INFORMACIÓN GENERAL Y CONTACTO */}
                        <AccordionSection
                            title="Información General"
                            icon={<Tag className="w-full h-full" />}
                            color="text-blue-400"
                            isOpen={openSection === 'general'}
                            onToggle={() => toggleSection('general')}
                            summary={local.name || "Sin Nombre"}
                            disabled={isUpdatingAny}
                        >
                            <div className="space-y-6">
                                <InputField 
                                    id="name" name="name" label="Nombre del Local"
                                    value={local.name} onChange={handleInputChange} required 
                                    placeholder="Ej: La Esquina del Sabor"
                                    icon={<Store className="w-4 h-4" />} disabled={isUpdatingAny}
                                />

                                <TextareaField
                                    id="description" name="description" label="Descripción Corta"
                                    value={local.description} onChange={handleInputChange}
                                    placeholder="Describe tu local"
                                    disabled={isUpdatingAny}
                                />

                                <div className="pt-6 border-t border-gray-700/30">
                                    <h4 className="text-lg font-bold text-gray-200 mb-6 flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <span>Ubicación y Contacto</span>
                                    </h4>

                                    <div className="space-y-5">
                                        <InputField
                                            id="address" name="address" label="Dirección Completa"
                                            value={local.address} onChange={handleInputChange}
                                            placeholder="Calle, número, ciudad"
                                            icon={<MapPin className="w-4 h-4" />} disabled={isUpdatingAny}
                                        />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <InputField
                                                id="phone" name="phone" label="Teléfono"
                                                value={local.phone} onChange={handleInputChange}
                                                type="tel" placeholder="+XX XXXX XXXX"
                                                icon={<Phone className="w-4 h-4" />} disabled={isUpdatingAny}
                                            />
                                            <InputField
                                                id="email" name="email" label="Email"
                                                value={local.email} onChange={handleInputChange}
                                                type="email" placeholder="contacto@local.com"
                                                icon={<Mail className="w-4 h-4" />} disabled={isUpdatingAny}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>

                        {/* ACORDEÓN 2: IMAGEN DEL LOCAL */}
                        <AccordionSection
                            title="Imagen Principal"
                            icon={<Image className="w-full h-full" />}
                            color="text-purple-400"
                            isOpen={openSection === 'image'}
                            onToggle={() => toggleSection('image')}
                            summary={local.image_url ? 'Imagen Subida' : 'Sin Imagen'}
                            disabled={isUpdatingAny}
                        >
                            <div className="space-y-6">
                                {local.image_url ? (
                                    <div className="relative group max-w-md mx-auto">
                                        <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gray-600/30 shadow-2xl">
                                            <img 
                                                src={local.image_url} 
                                                alt="Local" 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            disabled={isUpdatingAny}
                                            className="absolute top-3 right-3 p-2.5 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 shadow-lg"
                                            title="Eliminar Imagen"
                                        >
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-600/50 flex flex-col items-center justify-center bg-gray-700/20 max-w-md mx-auto backdrop-blur-sm">
                                        <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-3">
                                            <Image className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-400 text-center px-6">Sube una foto de tu local para mostrarla a tus clientes</p>
                                    </div>
                                )}
                                
                                <label className={`block max-w-md mx-auto py-4 px-6 rounded-xl font-bold text-center cursor-pointer transition-all shadow-lg ${
                                    isUploading || isUpdatingAny
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transform hover:scale-105'
                                }`}>
                                    {isUploading ? (
                                        <span className="flex items-center justify-center space-x-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Subiendo imagen...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center space-x-3">
                                            <Upload className="w-5 h-5" />
                                            <span>{local.image_url ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
                                        </span>
                                    )}
                                    <input
                                        type="file" accept="image/*" onChange={handleFileChange}
                                        className="hidden" disabled={isUpdatingAny}
                                    />
                                </label>
                            </div>
                        </AccordionSection>


                        {/* ACORDEÓN 3: HORARIOS SEMANALES */}
                        <ScheduleManager 
                            schedules={schedules}
                            setSchedules={setSchedules} 
                            handleScheduleChange={handleScheduleChange}
                            isUpdatingAny={isUpdatingAny}
                            isOpen={openSection === 'schedule'}
                            onToggle={() => toggleSection('schedule')}
                        />

                        {/* BOTÓN DE GUARDAR */}
                        <button
                            type="submit"
                            disabled={isUpdatingAny}
                            className={`w-full sticky bottom-0 z-10 py-5 px-6 rounded-2xl font-bold text-lg shadow-2xl transition-all flex items-center justify-center space-x-3 ${
                                isUpdatingAny
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                        >
                            {isUpdating ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Guardando Configuración...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    <span>Guardar Toda la Configuración</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LocalSettings;