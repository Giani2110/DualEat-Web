/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Calendar, Notebook, PlusCircle, Trash2, Edit, Pin, CheckCircle, Clock, AlertCircle, X, ChevronLeft, ChevronRight, HelpCircle, Loader } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import '../../assets/scss/users/users.scss';
import React from 'react'; // Importamos React para usar useRef

// ----------------------------------------------------------------------
// Interfaces de Datos
// ----------------------------------------------------------------------
interface LocalEvent {
  id: string;
  local_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  is_full_day?: boolean;
  event_type?: 'TASK' | 'MEETING' | 'REMINDER' | 'OTHER';
  status?: 'PENDING' | 'COMPLETED';
  priority?: number;
}

interface LocalNote {
  id: string;
  local_id: string;
  title: string;
  content: string;
  is_pinned?: boolean;
  is_completed?: boolean;
  due_date?: string;
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
        title: "Bienvenido a la Agenda",
        text: "Aquí puede gestionar todos los eventos, turnos y notas importantes de su local. Haga clic en Siguiente para empezar.",
        selector: "#help-button",
        placement: "left",
    },
    {
        id: 2,
        title: "Creación Rápida",
        text: "Utilice estos botones para crear rápidamente un nuevo Evento (para el calendario) o una nueva Nota (para tareas y recordatorios).",
        selector: "#creation-buttons",
        placement: "right", // Se ajustará a la derecha de los botones
    },
    {
        id: 3,
        title: "Vista de Calendario",
        text: "Muestra la vista mensual. Haga clic en cualquier día activo para ver los eventos asociados y crear nuevos.",
        selector: "#calendar-view",
        placement: "bottom",
    },
    {
        id: 4, 
        title: "Próximos Eventos",
        text: "Lista de los próximos eventos ordenados por fecha y hora para una planificación clara.",
        selector: "#upcoming-events-container",
        placement: "top", 
    },
    {
        id: 5,
        title: "Notas y Tareas",
        text: "Gestione sus tareas pendientes. Puede fijar (Pin) las notas importantes y marcarlas como completadas.",
        selector: "#notes-container",
        placement: "left",
    },
];


const LocalCalendar = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [localId, setLocalId] = useState<string | null>(null);
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'event' | 'note' | null>(null);
  const [editingItem, setEditingItem] = useState<LocalEvent | LocalNote | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  
  const [confirmationDetails, setConfirmationDetails] = useState<{ type: 'event' | 'note', id: string, title: string } | null>(null);

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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const getStatusColor = (status?: LocalEvent['status'] | LocalNote['is_completed']) => {
    if (typeof status === 'boolean') {
      return status ? 'bg-green-800/30 text-green-300' : 'bg-yellow-800/30 text-yellow-300';
    }
    const colors = {
      PENDING: 'bg-yellow-800/30 text-yellow-300',
      COMPLETED: 'bg-green-800/30 text-green-300',
    };
    return colors[status || 'PENDING'];
  };
  
  
  const getStatusIcon = (status?: LocalEvent['status'] | LocalNote['is_completed']): LucideIcon => {
    if (typeof status === 'boolean') {
      return status ? CheckCircle : Clock;
    }
    const icons = {
      PENDING: Clock,
      COMPLETED: CheckCircle,
    };
    return icons[status || 'PENDING'];
  };

  useEffect(() => {
    const fetchUserLocal = async () => {
      if (!user) {
        setLoading(false);
        setError('Usuario no autenticado');
        return;
      }
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

  const fetchCalendarData = async (id: string, date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const startOfMonth = new Date(year, month, 1 - 7).toISOString();
      const endOfMonth = new Date(year, month + 1, 7).toISOString();
      
      const [eventsRes, notesRes] = await Promise.allSettled([
        fetch(`${API_BASE}/calendar/local/${id}/events?start=${startOfMonth}&end=${endOfMonth}`),
        fetch(`${API_BASE}/calendar/local/${id}/notes`),
      ]);

      if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
        const data = await eventsRes.value.json();
        setEvents(data || []);
      } else {
        console.error('Error al cargar eventos');
      }

      if (notesRes.status === 'fulfilled' && notesRes.value.ok) {
        const data = await notesRes.value.json();
        setNotes(data || []);
      } else {
        console.error('Error al cargar notas');
      }

    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos del calendario y notas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localId) {
      fetchCalendarData(localId, currentDate);
    }
  }, [localId, API_BASE, currentDate]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
  }, []);

  const openModal = (type: 'event' | 'note', item: LocalEvent | LocalNote | null = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
    if (isDayModalOpen) {
        closeDayModal(); 
    }
  };

  const handleDayClick = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    
    setSelectedDate(selected);
    setIsDayModalOpen(true);
  };
  
  const handleCreateEventForDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);
    
    if (selectedDay < today) {
      setError('No se pueden crear eventos en fechas pasadas');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const dateStr = date.toISOString().substring(0, 16);
    setEditingItem({ start_time: dateStr } as LocalEvent);
    setModalType('event');
    setIsModalOpen(true);
    if (isDayModalOpen) {
      closeDayModal();
    }
  };
  
  const closeDayModal = useCallback(() => {
    setSelectedDate(null);
    setIsDayModalOpen(false);
  }, []);

  const handleDelete = (type: 'event' | 'note', id: string, title: string) => {
    setConfirmationDetails({ type, id, title });
    if (isDayModalOpen) {
        closeDayModal();
    }
  };
  
  const handleConfirmDelete = async (onDone: () => void) => {
    if (!confirmationDetails) return;
    const { type, id } = confirmationDetails;

    setLoading(true);
    const endpoint = type === 'event' ? `/calendar/events/${id}` : `/calendar/notes/${id}`;
    
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Error al eliminar ${type}`);
      
      await fetchCalendarData(localId!, currentDate);
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = useCallback(() => {
    setConfirmationDetails(null);
  }, []);
  
  const toggleEventStatus = async (event: LocalEvent, newStatus: LocalEvent['status'], closeModal?: () => void) => {
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE}/calendar/events/${event.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error('Error al actualizar estado del evento');
        
        if (selectedDate) {
            setSelectedDate(new Date(selectedDate));
        }
        await fetchCalendarData(localId!, currentDate);
        closeModal && closeModal();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const toggleNoteCompletion = async (note: LocalNote) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calendar/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !note.is_completed }),
      });
      if (!res.ok) throw new Error('Error al actualizar nota');
      await fetchCalendarData(localId!, currentDate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotePin = async (note: LocalNote) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calendar/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !note.is_pinned }),
      });
      if (!res.ok) throw new Error('Error al actualizar nota');
      await fetchCalendarData(localId!, currentDate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    const daysArray: (number | null)[] = [];
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    for (let i = 0; i < offset; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
      daysArray.push(i);
    }
    
    return daysArray;
  }, [currentDate]);
  
  const eventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dayStart = new Date(year, month, day, 0, 0, 0).getTime();
    const dayEnd = new Date(year, month, day, 23, 59, 59).getTime();

    return events.filter(event => {
      const eventStart = new Date(event.start_time).getTime();
      return eventStart >= dayStart && eventStart <= dayEnd;
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };
  
  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const day = selectedDate.getDate();
    return eventsForDay(day);
  }, [selectedDate, events]);
  
  const changeMonth = (delta: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
  };
  
  const monthName = currentDate.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' });

  const DayEventsModal = () => {
    if (!selectedDate || !isDayModalOpen) return null;
    
    const [isShowing, setIsShowing] = useState(false);
    
    useEffect(() => {
        if (isDayModalOpen) {
            setIsShowing(true); 
        }
    }, [isDayModalOpen]);

    const handleClose = useCallback(() => {
        setIsShowing(false);
        setTimeout(closeDayModal, 300); 
    }, [closeDayModal]);
    
    const dayEvents = eventsForSelectedDay;
    const titleDate = formatDateOnly(selectedDate.toISOString());
    
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    return (
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isShowing ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleWrapperClick}
      >
        <div 
            className={`bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-700 max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-400" /> Eventos del Día: {titleDate}</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
          <button 
            onClick={() => handleCreateEventForDay(selectedDate)}
            className="mb-4 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors cursor-pointer"
            disabled={selectedDate && (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const selected = new Date(selectedDate);
              selected.setHours(0, 0, 0, 0);
              return selected < today;
            })()}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Crear Evento en Este Día
          </button>
          <div className="space-y-4 overflow-y-auto pr-2">
            {dayEvents.length > 0 ? (
              dayEvents.map(event => {
                const StatusIcon = getStatusIcon(event.status);
                return (
                  <div key={event.id} className="bg-gray-700 p-3 rounded-lg flex flex-col sm:flex-row justify-between hover:ring-1 hover:ring-blue-600 transition-all">
                    <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                      <p className={`font-medium text-white truncate flex items-center`}>
                        <StatusIcon className="w-4 h-4 mr-2 text-blue-400" />
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400 ml-6">{event.description?.substring(0, 50) || 'Sin descripción'}{event.description && event.description.length > 50 ? '...' : ''}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1 ml-6">
                        <span>{formatDateTime(event.start_time).split(', ')[1]} - {event.end_time ? formatDateTime(event.end_time).split(', ')[1] : 'Sin fin'}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(event.status)}`}>{event.status}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 justify-end sm:justify-start pt-2 sm:pt-0">
                        {event.status !== 'COMPLETED' && <button onClick={() => toggleEventStatus(event, 'COMPLETED')} title="Marcar como Completado" className="p-1 rounded-full text-green-400 hover:bg-green-700/50 cursor-pointer"><CheckCircle className="w-4 h-4" /></button>}
                        {event.status !== 'PENDING' && <button onClick={() => toggleEventStatus(event, 'PENDING')} title="Marcar como Pendiente" className="p-1 rounded-full text-yellow-400 hover:bg-yellow-700/50 cursor-pointer"><Clock className="w-4 h-4" /></button>}
                        <button onClick={() => openModal('event', event)} title="Editar Evento" className="p-1 rounded-full text-gray-400 hover:text-blue-400 hover:bg-gray-600 cursor-pointer"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete('event', event.id, event.title)} title="Eliminar Evento" className="p-1 rounded-full text-gray-400 hover:text-red-400 hover:bg-gray-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No hay eventos para este día.</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const ConfirmationModal = () => {
    if (!confirmationDetails) return null;
    
    const [isShowing, setIsShowing] = useState(false);
    
    useEffect(() => {
        if (confirmationDetails) {
             setIsShowing(true);
        }
    }, [confirmationDetails]);

    const { type, title } = confirmationDetails;
    
    const handleClose = useCallback(() => {
        setIsShowing(false);
        setTimeout(handleCancelDelete, 300); 
    }, [handleCancelDelete]);

    const handleConfirm = () => {
        setIsShowing(false);
        setTimeout(() => handleConfirmDelete(handleCancelDelete), 300); 
    }
    
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-70 p-4 transition-opacity duration-300 ${isShowing ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleWrapperClick}
      >
        <div 
            className={`bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl border border-gray-700 text-center transform transition-all duration-300 ease-out ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold text-white mb-2">Confirmar Eliminación</h3>
          <p className="text-gray-400 mb-6">¿Estás seguro de que quieres eliminar est{type === 'event' ? 'e evento' : 'a nota'} "{title}"? Esta acción es irreversible.</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : `Sí, Eliminar ${type === 'event' ? 'Evento' : 'Nota'}`}
            </button>
            <button 
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const FormModal = ({ type, item, localId, onClose }: { type: 'event' | 'note', item: LocalEvent | LocalNote | null, localId: string, onClose: () => void }) => {
    
    const [isShowing, setIsShowing] = useState(false);
    
    useEffect(() => {
        if (isModalOpen) {
             setIsShowing(true);
        }
    }, [isModalOpen]);

    const handleClose = useCallback(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); 
    }, [onClose]);

    const isEditing = !!item && !!(item as LocalEvent).id;
    const initialTitle = item?.title || '';
    const initialContent = type === 'note' ? (item as LocalNote)?.content || '' : (item as LocalEvent)?.description || '';
    
    const getInitialStartTime = () => {
      if (type === 'event' && item) {
        const eventItem = item as LocalEvent;
        if (eventItem.start_time) {
          return eventItem.start_time.substring(0, 16);
        }
      }
      return '';
    };
    
    const initialStart = getInitialStartTime();
    const initialEnd = type === 'event' && isEditing && (item as LocalEvent).end_time ? (item as LocalEvent).end_time?.substring(0, 16) : '';
    const initialDue = type === 'note' && isEditing && (item as LocalNote).due_date ? (item as LocalNote).due_date?.substring(0, 10) : '';

    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [startTime, setStartTime] = useState(initialStart);
    const [endTime, setEndTime] = useState(initialEnd);
    const [dueDate, setDueDate] = useState(initialDue);
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      
      let endpoint = '';
      let method = '';
      let body: any = { local_id: localId, title };
      
      if (type === 'event') {
        body.start_time = startTime;
        body.description = content;
        if (endTime) body.end_time = endTime;
        
        endpoint = isEditing ? `/calendar/events/${item?.id}` : '/calendar/events';
        method = isEditing ? 'PUT' : 'POST';
      } else {
        body.content = content;
        if (dueDate) body.due_date = dueDate;
        
        endpoint = isEditing ? `/calendar/notes/${item?.id}` : '/calendar/notes';
        method = isEditing ? 'PUT' : 'POST';
      }

      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`Error al ${isEditing ? 'actualizar' : 'crear'} el ${type}`);

        await fetchCalendarData(localId, currentDate);
        if (isDayModalOpen && selectedDate) {
            setSelectedDate(new Date(selectedDate));
        }
        handleClose();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-60 p-4 transition-opacity duration-300 ${isShowing ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleWrapperClick}
      >
        <div 
            className={`bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700 transform transition-all duration-300 ease-out ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{isEditing ? 'Editar' : 'Crear'} {type === 'event' ? 'Evento' : 'Nota'}</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{type === 'event' ? 'Descripción' : 'Contenido'}</label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required 
                rows={3}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            {type === 'event' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Hora de Inicio</label>
                  <input 
                    type="datetime-local" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                    required 
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Hora de Fin (Opcional)</label>
                  <input 
                    type="datetime-local" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
            {type === 'note' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fecha Límite (Opcional)</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            <button 
              type="submit" 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              {isEditing ? 'Actualizar' : 'Crear'} {type === 'event' ? 'Evento' : 'Nota'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // Componente Modal Flotante del Tour
  // ----------------------------------------------------------------------
    const TourModal = () => {
        // Almacena las coordenadas del elemento objetivo RELATIVAS AL VIEWPORT
        const [bounds, setBounds] = useState<Bounds | null>(null);
        const [isPositioned, setIsPositioned] = useState(false); // Nuevo estado para controlar el fade-in
        const modalRef = React.useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (!activeStep) return;

            const element = document.querySelector(activeStep.selector) as HTMLElement;
            if (!element) return;
            
            // 1. Desplazar la página si el elemento no está en la vista
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const updateBoundsAndPosition = () => {
                const rect = element.getBoundingClientRect();
                
                const padding = 10; 

                // Las bounds son RELATIVAS AL VIEWPORT (posición fija)
                setBounds({
                    top: rect.top - padding,
                    left: rect.left - padding,
                    width: rect.width + 2 * padding,
                    height: rect.height + 2 * padding,
                });
                
                // 2. Calcular la posición del MODAL (está fijo, por lo que usa coordenadas de la ventana)
                if (modalRef.current) {
                    let modalStyle: React.CSSProperties = { top: 0, left: 0 };
                    
                    const OFFSET_DISTANCE = 25; 
                    const MODAL_WIDTH = 320; 
                    const MODAL_HEIGHT = 180; // Altura aproximada, ajustada a la altura real del contenido del modal

                    // Calcular la posición del modal usando coordenadas de la VENTANA (rect)
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
                    
                    // Aseguramos que el modal no se salga de los bordes de la ventana
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
                    setIsPositioned(true); // Marca que el modal está en posición
                }
            };

            // Pequeño retardo para dar tiempo al scroll 'smooth'
            const timeout = setTimeout(updateBoundsAndPosition, 350); 
            
            updateBoundsAndPosition();
            window.addEventListener('resize', updateBoundsAndPosition);
            window.addEventListener('scroll', updateBoundsAndPosition);

            return () => {
                clearTimeout(timeout);
                window.removeEventListener('resize', updateBoundsAndPosition);
                window.removeEventListener('scroll', updateBoundsAndPosition);
                setIsPositioned(false); // Resetea al salir del paso
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
                    ref={modalRef} // Referencia para aplicar estilos de posición
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

  if (loading && !localId) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando calendario...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center p-6 bg-gray-800 rounded-xl shadow-lg border border-red-700 text-red-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="font-semibold text-lg mb-2">Error al cargar la aplicación de calendario</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="BGLocal min-h-screen text-white relative">
      
      {/* Componente Modal del Tour */}
      <TourModal />
      
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

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl pt-12 font-bold text-white mb-2">Calendario y Agenda</h1>
          <p className="text-gray-400 mb-8">Administra eventos, turnos y notas importantes de tu local.</p>

          {/* CONTENEDOR DE BOTONES - CAMBIO: de "flex" a "inline-flex" para ajustar el ancho */}
          <div className="inline-flex space-x-4 mb-8" id="creation-buttons">
            <button 
              onClick={() => openModal('event')}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors cursor-pointer"
              title="Crear un nuevo evento en el calendario"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Nuevo Evento
            </button>
            <button 
              onClick={() => openModal('note')}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors cursor-pointer"
              title="Crear una nueva nota o tarea"
            >
              <Notebook className="w-5 h-5 mr-2" />
              Nueva Nota
            </button>
          </div>
          {/* FIN CONTENEDOR DE BOTONES CORREGIDO */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-400" /> Calendario: {monthName}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    title='Mes anterior'
                    onClick={() => changeMonth(-1)}
                    className="p-1 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    title='Mes siguiente'
                    onClick={() => changeMonth(1)}
                    className="p-1 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 text-sm mb-2">
                <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span className="text-red-400">Sáb</span><span className="text-red-400">Dom</span>
              </div>
              
              <div className="grid grid-cols-7 gap-1 h-96" id="calendar-view">
                {daysInMonth.map((day, index) => {
                  const dayDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isToday = dayDate && dayDate.toDateString() === today.toDateString();
                  const isPast = dayDate && dayDate < today;
                  const dayEvents = day ? eventsForDay(day) : [];

                  return (
                    <div 
                      key={index} 
                      className={`
                        p-1 text-sm rounded-lg relative transition-all
                        ${day === null ? 'invisible' : `${isPast ? 'bg-gray-900/50 cursor-not-allowed opacity-50' : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'}`}
                        ${isToday ? 'border-2 border-blue-500' : 'border border-gray-700'}
                      `}
                      title={day ? `${dayEvents.length} evento${dayEvents.length !== 1 ? 's' : ''}` : ''}
                      onClick={() => day && !isPast && handleDayClick(day)}
                    >
                      <span className={`font-bold ${isToday ? 'text-blue-400' : isPast ? 'text-gray-600' : 'text-white'}`}>{day}</span>
                      {dayEvents.length > 0 && (
                        <div className="absolute top-6 left-0 right-0 bottom-0 px-1 flex flex-col gap-0.5 overflow-hidden">
                            {dayEvents.slice(0, 2).map((event) => (
                                <div 
                                    key={event.id} 
                                    className={`text-[9px] px-1 py-0.5 rounded truncate ${
                                      event.status === 'COMPLETED' 
                                        ? 'bg-green-600/80 text-green-100' 
                                        : 'bg-blue-600/80 text-blue-100'
                                    }`}
                                    title={`${event.title} - ${formatDateTime(event.start_time).split(', ')[1]}`}
                                >
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 2 && (
                                <div className="text-[8px] text-center text-gray-300 bg-gray-800/70 px-1 rounded">
                                    +{dayEvents.length - 2} más
                                </div>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <h4 className="text-lg font-semibold text-white mt-6 mb-3">Próximos Eventos</h4>
              <div className="space-y-3" id="upcoming-events-container" style={{ minHeight: '150px' }}>
                {events.filter(e => new Date(e.start_time).getTime() >= new Date().getTime()).slice(0, 4).map(event => {
                  const StatusIcon = getStatusIcon(event.status); 
                  return (
                    <div key={event.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center hover:ring-1 hover:ring-blue-600 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{event.title}</p>
                        <p className="text-sm text-gray-400 truncate flex items-center">
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {formatDateTime(event.start_time)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>{event.status}</span>
                          <button onClick={() => openModal('event', event)} title="Editar Evento" className="text-gray-400 hover:text-blue-400 p-1 rounded-full hover:bg-gray-600 cursor-pointer"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete('event', event.id, event.title)} title="Eliminar Evento" className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
                {events.filter(e => new Date(e.start_time).getTime() >= new Date().getTime()).length === 0 && <p className="text-gray-500 text-center py-4">No hay eventos próximos registrados.</p>}
              </div>

            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 lg:col-span-1" id="notes-container">
              <h3 className="text-lg font-semibold text-white flex items-center mb-4"><Notebook className="w-5 h-5 mr-2 text-yellow-400" /> Notas y Tareas</h3>
              
              <div className="space-y-4" style={{ minHeight: '400px' }}>
                {notes.length > 0 ? (
                  notes.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)).map(note => (
                    <div 
                      key={note.id} 
                      className={`p-3 rounded-lg transition-all border ${note.is_pinned ? 'bg-yellow-800/20 border-yellow-700 ring-2 ring-yellow-500/50' : 'bg-gray-700 border-gray-700 hover:ring-1 hover:ring-gray-600'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className={`font-medium ${note.is_completed ? 'text-gray-400' : 'text-white'} truncate transition-[text-decoration-color,color] duration-700`}
                           style={{ textDecoration: note.is_completed ? 'line-through' : 'none', textDecorationColor: note.is_completed ? 'rgba(156, 163, 175, 0.7)' : 'transparent' }}
                        >
                            {note.title}
                        </p>
                        <div className="flex space-x-2">
                          <button onClick={() => toggleNotePin(note)} title={note.is_pinned ? 'Desfijar' : 'Fijar'} className={`p-1 rounded-full cursor-pointer ${note.is_pinned ? 'text-yellow-400 bg-yellow-900/50' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}><Pin className="w-4 h-4" /></button>
                          <button onClick={() => toggleNoteCompletion(note)} title={note.is_completed ? 'Marcar como Pendiente' : 'Marcar como Completa'} className={`p-1 rounded-full cursor-pointer ${note.is_completed ? 'text-green-400 bg-green-900/50' : 'text-gray-400 hover:text-white hover:bg-gray-600'}`}><CheckCircle className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-2 whitespace-pre-wrap">{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{note.due_date ? `Vence: ${new Date(note.due_date).toLocaleDateString('es-AR')}` : 'Sin fecha límite'}</span>
                        <div className='flex space-x-2'>
                            <button onClick={() => openModal('note', note)} title="Editar Nota" className="text-gray-400 hover:text-blue-400 cursor-pointer"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('note', note.id, note.title)} title="Eliminar Nota" className="text-gray-400 hover:text-red-400 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay notas registradas. Crea una para empezar.</p>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {isModalOpen && modalType && localId && (
        <FormModal 
          type={modalType} 
          item={editingItem} 
          localId={localId} 
          onClose={closeModal} 
        />
      )}
      {isDayModalOpen && selectedDate && <DayEventsModal />}
      {confirmationDetails && <ConfirmationModal />}
      
      {(loading && (isModalOpen || isDayModalOpen || confirmationDetails)) && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[80] p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
      )}
    </div>
  );
};

export default LocalCalendar;