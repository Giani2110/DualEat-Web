import { Router } from 'express';
import { 
  listEventsController, 
  createEventController, 
  updateEventController, 
  deleteEventController,
  listNotesController,
  createNoteController,
  updateNoteController,
  deleteNoteController
} from '../controller/calendar.controller';

const router = Router();

// RUTAS DE CALENDARIO (LocalCalendarEvent)
// Obtener todos los eventos de un local en un rango de fechas
router.get('/local/:localId/events', listEventsController);

// Crear un nuevo evento de calendario
router.post('/events', createEventController);

// Actualizar un evento de calendario
router.put('/events/:eventId', updateEventController);

// Eliminar un evento de calendario
router.delete('/events/:eventId', deleteEventController);


// RUTAS DE NOTAS/AGENDA (LocalNote)
// Obtener todas las notas de un local
router.get('/local/:localId/notes', listNotesController);

// Crear una nueva nota
router.post('/notes', createNoteController);

// Actualizar una nota (marcar como completada, cambiar título, etc.)
router.put('/notes/:noteId', updateNoteController);

// Eliminar una nota
router.delete('/notes/:noteId', deleteNoteController);


export default router;