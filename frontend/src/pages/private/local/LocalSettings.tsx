import React from 'react';
import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '@context/auth/AuthContext'; 
import { AlertCircle, Save, Clock, MapPin, Image, Upload, Trash, Tag, CheckCircle, Store, Phone, Mail, X, Plus, ChevronDown } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'; 
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css'; 

// ====================================================================
// 1. INTERFACES Y CONSTANTES
// ====================================================================

type DayOfWeek = "LUNES" | "MARTES" | "MIERCOLES" | "JUEVES" | "VIERNES" | "SABADO" | "DOMINGO";
type SectionKey = 'general' | 'image' | 'schedule';

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
    latitude: number | null; 
    longitude: number | null; 
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
    latitude: number | null; 
    longitude: number | null; 
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

const SECTIONS = [
    { key: 'general' as SectionKey, title: 'Información General', icon: Tag },
    { key: 'schedule' as SectionKey, title: 'Horarios Semanales', icon: Clock },
    { key: 'image' as SectionKey, title: 'Imagen Principal', icon: Image },
];


// ====================================================================
// 2. COMPONENTES HELPER
// ====================================================================

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

const InputField = ({ id, name, label, value, onChange, type = 'text', required = false, placeholder = '', icon, disabled = false, onClick, readOnly = false, onKeyDown }: any) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          onClick={onClick} 
          onKeyDown={onKeyDown} 
          readOnly={readOnly} 
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-gray-700/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm ${readOnly || onClick ? 'cursor-pointer' : ''}`}
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


interface ScheduleManagerProps {
    schedules: ScheduleItem[];
    setSchedules: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
    handleScheduleChange: (day: DayOfWeek, field: 'open_time' | 'close_time', value: string) => void;
    isUpdatingAny: boolean;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
    schedules,
    setSchedules,
    handleScheduleChange,
    isUpdatingAny,
}) => {
    
    const [openDay, setOpenDay] = useState<DayOfWeek | null>(null);

    const getScheduleForDay = (day: DayOfWeek): ScheduleItem | undefined => {
        return schedules.find(s => s.day_of_week === day);
    };

    const toggleDay = (day: DayOfWeek) => {
        if (getScheduleForDay(day)) {
            setSchedules((prev: ScheduleItem[]) => prev.filter((s: ScheduleItem) => s.day_of_week !== day));
            if (openDay === day) setOpenDay(null);
        } else {
            const defaultSchedule: ScheduleItem = {
                day_of_week: day,
                open_time: '09:00',
                close_time: '18:00',
            };
            setSchedules((prev: ScheduleItem[]) => {
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
    
    return (
        <div className="space-y-4 pt-4">
            <h3 className="text-xl font-bold text-white mb-4">Configuración de Horarios</h3>
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
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); toggleDay(day); }}
                                    disabled={isUpdatingAny}
                                    title={isActive ? "Desactivar Día" : "Activar Día"}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
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
    );
};


// ====================================================================
// 3. FUNCIONES Y COMPONENTES DE MAPA
// ====================================================================

const forwardGeocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!address) return null;
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
            };
        }
        return null;
    } catch (error) {
        return null;
    }
};

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.address) {
            const address = data.address;
            const street = address.road || address.pedestrian;
            const houseNumber = address.house_number;
            const city = address.city || address.town || address.village || address.county;
            const state = address.state;

            let display = '';
            
            if (street) {
                display = street;
                if (houseNumber) {
                    display += ` ${houseNumber}`;
                }
            } else if (data.display_name) {
                return data.display_name;
            } else {
                return `[Ubicación desconocida]: Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            }

            if (city) {
                display += `, ${city}`;
            }
            if (state && !display.includes(state)) {
                 display += `, ${state}`;
            }
            return display;

        } else {
            return `[Ubicación desconocida]: Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        }
    } catch (error) {
        return `[Error de red]: Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    }
};


interface MapLocationSelectorProps {
    address: string;
    currentLat: number | null;
    currentLng: number | null;
    isOpen: boolean;
    onClose: () => void;
    onSaveLocation: (newAddress: string, lat: number, lng: number) => void;
    isSaving: boolean;
}

interface MapHandlerProps {
    setSelectedPosition: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
    setTempAddress: React.Dispatch<React.SetStateAction<string>>;
}

interface MapCentererProps {
    position: [number, number];
}

const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapCenterer: React.FC<MapCentererProps> = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position as L.LatLngExpression, map.getZoom(), {
            animate: true,
            duration: 0.8
        });
    }, [position, map]);

    return null;
}

const MapHandler: React.FC<MapHandlerProps> = ({ setSelectedPosition, setTempAddress }) => {
    useMapEvents({
        async click(e: L.LeafletMouseEvent) { 
            const { lat, lng } = e.latlng;
            setSelectedPosition({ lat, lng });
            
            const newAddress = await reverseGeocode(lat, lng);
            setTempAddress(newAddress); 
        },
    });
    return null;
}

const MapLocationSelector: React.FC<MapLocationSelectorProps> = ({
    address, 
    currentLat,
    currentLng,
    isOpen,
    onClose,
    onSaveLocation,
    isSaving,
}) => {
    const DEFAULT_LAT: number = -34.6037;
    const DEFAULT_LNG: number = -58.3816;
    
    const [tempAddress, setTempAddress] = useState(address);
    const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
        currentLat !== null && currentLng !== null ? { lat: currentLat, lng: currentLng } : null
    );
    
    const initialLat = currentLat ?? DEFAULT_LAT;
    const initialLng = currentLng ?? DEFAULT_LNG;
    const mapCenter: [number, number] = selectedPosition ? [selectedPosition.lat, selectedPosition.lng] : [initialLat, initialLng];
    
    const debouncedGeocode = useCallback(
        debounce(async (searchAddress: string) => {
            if (searchAddress.length > 5) {
                const newCoords = await forwardGeocode(searchAddress);
                if (newCoords) {
                    setSelectedPosition(newCoords);
                }
            }
        }, 500),
        []
    );

    useEffect(() => {
        if (isOpen) {
            setSelectedPosition(currentLat !== null && currentLng !== null 
                ? { lat: currentLat, lng: currentLng } 
                : null
            );
            setTempAddress(address);
        }
    }, [isOpen, currentLat, currentLng, address]); 

    const handleAddressChangeAndGeocode = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAddress = e.target.value;
        setTempAddress(newAddress);
        
        debouncedGeocode(newAddress);
    };

    const handleSave = async () => {
        if (!selectedPosition) {
            alert('Por favor, haz clic en el mapa o busca una dirección para seleccionar una ubicación.');
            return;
        }

        const finalCoords = await forwardGeocode(tempAddress);

        if (finalCoords) {
            onSaveLocation(tempAddress, finalCoords.lat, finalCoords.lng);
        } else {
            onSaveLocation(tempAddress, selectedPosition.lat, selectedPosition.lng);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 max-w-2xl w-full h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <span>Seleccionar Ubicación Exacta</span>
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 cursor-pointer" disabled={isSaving}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                                        
                    <InputField 
                        id="map-final-address" name="map-final-address" label="Dirección (El mapa se actualiza al escribir)"
                        value={tempAddress} 
                        onChange={handleAddressChangeAndGeocode} 
                        placeholder="Escribe la calle, número y ciudad"
                        disabled={isSaving}
                        readOnly={false} 
                    />
                    
                    <div className="h-96 w-full rounded-xl overflow-hidden border-2 border-gray-600/50">
                        <MapContainer 
                            center={mapCenter as L.LatLngExpression} 
                            zoom={currentLat ? 16 : 13} 
                            scrollWheelZoom={true} 
                            className="h-full w-full"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapCenterer position={mapCenter} />
                            <MapHandler setSelectedPosition={setSelectedPosition} setTempAddress={setTempAddress} /> 

                            {selectedPosition && (
                                <Marker position={[selectedPosition.lat, selectedPosition.lng] as L.LatLngExpression} icon={customIcon as any} />
                            )}
                        </MapContainer>
                    </div>
                    
                    <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                        <p className="font-semibold text-white mb-2">Coordenadas Finales:</p>
                        <p className="text-sm text-gray-300 break-all">
                             {selectedPosition ? `Latitud: ${selectedPosition.lat.toFixed(6)}, Longitud: ${selectedPosition.lng.toFixed(6)}` : 'N/A - Fija la ubicación para guardar'}
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-700">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !selectedPosition}
                        className={`w-full py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 shadow-lg ${
                            isSaving || !selectedPosition
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-[1.01] active:scale-[0.99]'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Confirmando Ubicación...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Confirmar Ubicación</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ====================================================================
// 4. COMPONENTE PRINCIPAL: LocalSettings
// ====================================================================

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null;
    return function(...args: Parameters<T>) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

const LocalSettings = () => {
    const authContext = useContext(AuthContext) as AuthContextType;
    const user = authContext?.user; 
    
    const [localId, setLocalId] = useState<string | null>(null);
    const [local, setLocal] = useState<LocalSettingsData | null>(null);
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]); 
    const [currentSection, setCurrentSection] = useState<SectionKey>('general');
    
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false); 

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
    
    const handleAddressInputClick = () => {
        if (!isUpdatingAny) {
            setShowMapModal(true);
        }
    };
    
    const handleSaveLocation = (newAddress: string, lat: number, lng: number) => {
        if (local) {
            setLocal({ ...local, address: newAddress, latitude: lat, longitude: lng }); 
            setSuccessMessage('Ubicación y Coordenadas seleccionadas. ¡Recordá guardar la configuración general!');
        }
        setShowMapModal(false);
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
                    latitude: localData.latitude ?? null, 
                    longitude: localData.longitude ?? null, 
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
        if (name === 'address') return;
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
            latitude: local!.latitude, 
            longitude: local!.longitude, 
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
    
    // ====================================================================
    // 5. RENDERS DE SECCIONES (Funciones para renderizar cada panel)
    // ====================================================================

    const renderGeneralSection = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-white mb-4">Información y Contacto</h2>
            <InputField id="name" name="name" label="Nombre del Local" value={local!.name} onChange={handleInputChange} required placeholder="Ej: La Esquina del Sabor" icon={<Store className="w-4 h-4" />} disabled={isUpdatingAny}/>
            <TextareaField id="description" name="description" label="Descripción Corta" value={local!.description} onChange={handleInputChange} placeholder="Describe tu local" disabled={isUpdatingAny}/>

            <div className="pt-6 border-t border-gray-700/30 space-y-5">
                <h3 className="text-xl font-bold text-gray-200 flex items-center space-x-2"><MapPin className="w-5 h-5 text-blue-400" /><span>Ubicación y Contacto</span></h3>
                
                <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-300">
                        Dirección Completa <span className="text-gray-500 font-normal">(Click para establecer ubicación exacta)</span>
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors pointer-events-none"><MapPin className="w-4 h-4" /></div>
                        <input type="text" id="address" name="address" value={local!.address || ''} onChange={handleInputChange} onClick={handleAddressInputClick} readOnly={true} required placeholder="Toca aquí para seleccionar en el mapa" disabled={isUpdatingAny} className={`w-full pl-12 pr-4 py-3.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-gray-700/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}/>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField id="phone" name="phone" label="Teléfono" value={local!.phone} onChange={handleInputChange} type="tel" placeholder="+XX XXXX XXXX" icon={<Phone className="w-4 h-4" />} disabled={isUpdatingAny}/>
                    <InputField id="email" name="email" label="Email" value={local!.email} onChange={handleInputChange} type="email" placeholder="contacto@local.com" icon={<Mail className="w-4 h-4" />} disabled={isUpdatingAny}/>
                </div>
            </div>
        </div>
    );

    const renderImageSection = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-white mb-4">Imagen Principal del Local</h2>
            {local!.image_url ? (
                <div className="relative group max-w-md mx-auto">
                    <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gray-600/30 shadow-2xl">
                        <img src={local!.image_url} alt="Local" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                    </div>
                    <button type="button" onClick={handleRemoveImage} disabled={isUpdatingAny} className="absolute top-3 right-3 p-2.5 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 shadow-lg cursor-pointer" title="Eliminar Imagen"><Trash className="w-5 h-5" /></button>
                </div>
            ) : (
                <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-600/50 flex flex-col items-center justify-center bg-gray-700/20 max-w-md mx-auto backdrop-blur-sm">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-3"><Image className="w-8 h-8 text-gray-400" /></div><p className="text-sm text-gray-400 text-center px-6">Sube una foto de tu local para mostrarla a tus clientes</p>
                </div>
            )}
            <label className={`block max-w-md mx-auto py-4 px-6 rounded-xl font-bold text-center cursor-pointer transition-all shadow-lg ${isUploading || isUpdatingAny ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transform hover:scale-105'}`}>
                {isUploading ? (<span className="flex items-center justify-center space-x-3"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Subiendo imagen...</span></span>) : (<span className="flex items-center justify-center space-x-3"><Upload className="w-5 h-5" /><span>{local!.image_url ? 'Cambiar Imagen' : 'Subir Imagen'}</span></span>)}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUpdatingAny}/>
            </label>
        </div>
    );

    const renderScheduleSection = () => (
        <div className="animate-in fade-in duration-300">
            <ScheduleManager 
                schedules={schedules}
                setSchedules={setSchedules} 
                handleScheduleChange={handleScheduleChange}
                isUpdatingAny={isUpdatingAny}
            />
        </div>
    );
    
    const renderSection = () => {
        switch (currentSection) {
            case 'general':
                return renderGeneralSection();
            case 'image':
                return renderImageSection();
            case 'schedule':
                return renderScheduleSection();
            default:
                return null;
        }
    };
    
    // ====================================================================
    // 6. RENDERIZADO PRINCIPAL
    // ====================================================================
    
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="relative w-16 h-16 mx-auto mb-6"><div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div><div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div></div><p className="text-gray-300 font-medium">Cargando configuración...</p></div></div>
    );

    if (error && !local) return (
        <div className="min-h-screen flex items-center justify-center p-6"><div className="text-center p-8 bg-gradient-to-br from-gray-800/80 to-gray-800/50 rounded-2xl shadow-2xl border border-red-700/30 text-red-400 backdrop-blur-sm max-w-md"><div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-red-500" /></div><p className="font-bold text-xl mb-2">Error al cargar la configuración</p><p className="text-gray-300">{error}</p></div></div>
    );
    
    if (!local) return (
        <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-400 font-medium">No se encontraron datos del local</p></div>
    );

    return (
        <div className="min-h-screen text-white relative">
            {/* Modal de eliminación */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center space-x-3 mb-4"><div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-400" /></div><h3 className="text-xl font-bold text-white">¿Eliminar imagen?</h3></div>
                        <p className="text-gray-300 mb-6">Esta acción quitará la imagen actual del local. Deberás guardar la configuración para confirmar los cambios.</p>
                        <div className="flex space-x-3">
                            <button onClick={cancelRemoveImage} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors cursor-pointer">Cancelar</button>
                            <button onClick={confirmRemoveImage} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors cursor-pointer">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal del Mapa */}
            <LocalSettings.MapLocationSelector 
                address={local.address}
                currentLat={local.latitude}
                currentLng={local.longitude}
                isOpen={showMapModal}
                onClose={() => setShowMapModal(false)}
                onSaveLocation={handleSaveLocation}
                isSaving={isUpdatingAny}
            />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                
                {/* 🌟 ENCBEZADO ALINEADO CON QR.tsx 🌟 */}
                <header className="pt-12 pb-8">
                    {/* Alineación similar al QR (pt-12, mb-2, pb-8) */}
                    <h1 className="text-3xl font-bold text-white pt-12 mb-2">Ajustes del Local</h1>
                    <p className="text-gray-400">Personaliza la información, horarios y presencia de tu negocio.</p>
                </header>

                {successMessage && <SuccessAlert message={successMessage} />}
                {error && <ErrorAlert message={error} />}

                <form onSubmit={handleUnifiedSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Panel de Navegación Lateral (Columna 1) */}
                    <div className="lg:col-span-1 space-y-2 bg-gray-800/50 p-4 rounded-xl self-start sticky top-4">
                        {SECTIONS.map((section) => {
                            const IconComponent = section.icon;
                            const isActive = currentSection === section.key;
                            return (
                                <button
                                    key={section.key}
                                    type="button"
                                    onClick={() => setCurrentSection(section.key)}
                                    className={`w-full text-left flex items-center p-4 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                                        isActive 
                                            ? 'bg-blue-600/30 text-blue-300 shadow-lg border border-blue-600/50' 
                                            : 'text-gray-300 hover:bg-gray-700/50'
                                    }`}
                                    disabled={isUpdatingAny}
                                >
                                    <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>{section.title}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Contenido de la Sección Activa y Botón de Guardar (Columna 2) */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Contenido de la sección */}
                        <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700/50 min-h-[600px]">
                            {renderSection()}
                        </div>
                        
                        {/* 🌟 BOTÓN DE GUARDAR EN EL FLUJO NORMAL (NO STICKY) 🌟 */}
                        <button
                            type="submit"
                            disabled={isUpdatingAny}
                            className={`w-full py-5 px-6 rounded-2xl font-bold text-lg shadow-2xl transition-all flex items-center justify-center space-x-3 cursor-pointer ${
                                isUpdatingAny
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                        >
                            {isUpdating ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Guardando Cambios...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-6 h-6" />
                                    <span>Guardar Configuración</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

LocalSettings.MapLocationSelector = MapLocationSelector;

export default LocalSettings;