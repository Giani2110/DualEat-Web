import {
  PrismaClient,
  LocalCalendarEvent,
  LocalNote,
  LocalEventType,
  EventStatus,
} from "@prisma/client";
const prisma = new PrismaClient();

// LÓGICA DE EVENTOS DE CALENDARIO
export const getEventsByLocal = async (
  localId: string,
  startDate: Date,
  endDate: Date
) => {
  return await prisma.localCalendarEvent.findMany({
    where: {
      local_id: localId,
      start_time: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      start_time: "asc",
    },
  });
};

export const createEvent = async (data: {
  local_id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time?: Date;
  is_full_day?: boolean;
  event_type?: LocalEventType;
  status?: EventStatus;
  priority?: number;
}): Promise<LocalCalendarEvent> => {
  return await prisma.localCalendarEvent.create({ data });
};

export const updateEvent = async (
  eventId: string,
  data: Partial<LocalCalendarEvent>
): Promise<LocalCalendarEvent> => {
  const updatePayload: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    if (key === "status" && typeof value === "string") {
      if (Object.values(EventStatus).includes(value as EventStatus)) {
        updatePayload.status = value as EventStatus;
      }
    } else if (key === "priority") {
      updatePayload.priority = Number(value);
    } else {
      updatePayload[key] = value;
    }
  }

  return await prisma.localCalendarEvent.update({
    where: { id: eventId },
    data: updatePayload,
  });
};

export const deleteEvent = async (eventId: string) => {
  return await prisma.localCalendarEvent.delete({ where: { id: eventId } });
};

// LÓGICA DE NOTAS
export const getNotesByLocal = async (localId: string) => {
  return await prisma.localNote.findMany({
    where: { local_id: localId },
    orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
  });
};

export const createNote = async (data: {
  local_id: string;
  title: string;
  content: string;
  is_pinned?: boolean;
  is_completed?: boolean;
  due_date?: Date;
}): Promise<LocalNote> => {
  return await prisma.localNote.create({ data });
};

export const updateNote = async (
  noteId: string,
  data: Partial<LocalNote>
): Promise<LocalNote> => {
  return await prisma.localNote.update({
    where: { id: noteId },
    data,
  });
};

export const deleteNote = async (noteId: string) => {
  return await prisma.localNote.delete({ where: { id: noteId } });
};
