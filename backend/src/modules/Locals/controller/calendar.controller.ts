import { Request, Response } from 'express';
import * as service from '../service/calendar.service';
import { LocalEventType, EventStatus } from '@prisma/client';

// CONTROLADORES DE EVENTOS

export const listEventsController = async (req: Request, res: Response) => {
  try {
    const localId = req.params.localId;
    const { start, end } = req.query;

    if (!localId || typeof start !== 'string' || typeof end !== 'string') {
      return res.status(400).json({ error: "Local y fechas son requeridos" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "fechas no validas" });
    }

    const events = await service.getEventsByLocal(localId, startDate, endDate);
    
    return res.status(200).json(events);
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const createEventController = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.local_id || !data.title || !data.start_time) {
      return res.status(400).json({ error: "Local ID, title, and start_time are required to create an event." });
    }

    const eventData = {
      ...data,
      start_time: new Date(data.start_time),
      end_time: data.end_time ? new Date(data.end_time) : undefined,
      priority: data.priority ? parseInt(data.priority) : undefined,
      event_type: data.event_type as LocalEventType,
      status: data.status as EventStatus,
    };
    
    const newEvent = await service.createEvent(eventData);
    return res.status(201).json(newEvent);
  } catch (error: any) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const updateEventController = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const dataToUpdate = req.body;

    if (dataToUpdate.start_time) dataToUpdate.start_time = new Date(dataToUpdate.start_time);
    if (dataToUpdate.end_time) dataToUpdate.end_time = new Date(dataToUpdate.end_time);
    if (dataToUpdate.priority) dataToUpdate.priority = parseInt(dataToUpdate.priority);

    const updatedEvent = await service.updateEvent(eventId, dataToUpdate);
    return res.status(200).json(updatedEvent);
  } catch (error: any) {
    console.error('Error updating event:', error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const deleteEventController = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    await service.deleteEvent(eventId);
    return res.status(200).json({ success: true, message: "Event deleted successfully." });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// CONTROLADORES DE NOTAS
export const listNotesController = async (req: Request, res: Response) => {
  try {
    const localId = req.params.localId;
    if (!localId) {
      return res.status(400).json({ error: "Local ID is required." });
    }

    const notes = await service.getNotesByLocal(localId);
    return res.status(200).json(notes);
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const createNoteController = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    if (!data.local_id || !data.title || !data.content) {
      return res.status(400).json({ error: "Local ID, title, and content are required to create a note." });
    }

    const noteData = {
      ...data,
      due_date: data.due_date ? new Date(data.due_date) : undefined,
    };

    const newNote = await service.createNote(noteData);
    return res.status(201).json(newNote);
  } catch (error: any) {
    console.error('Error creating note:', error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const updateNoteController = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.noteId;
    const dataToUpdate = req.body;

    if (dataToUpdate.due_date) dataToUpdate.due_date = new Date(dataToUpdate.due_date);

    const updatedNote = await service.updateNote(noteId, dataToUpdate);
    return res.status(200).json(updatedNote);
  } catch (error: any) {
    console.error('Error updating note:', error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const deleteNoteController = async (req: Request, res: Response) => {
  try {
    const noteId = req.params.noteId;
    await service.deleteNote(noteId);
    return res.status(200).json({ success: true, message: "Nota eliminada correctamente." });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};