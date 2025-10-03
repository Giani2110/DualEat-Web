// settings/settings.service.ts

import { prisma } from "../../../prisma/prisma";
// Importamos los tipos necesarios (Local, LocalSchedule, y el Enum DayOfWeek)
import { Local, LocalSchedule, DayOfWeek } from "@prisma/client"; 

// --- Nuevo tipo para la data de horarios (DTO para la entrada) ---
// Define la estructura de un solo horario
type ScheduleInput = {
    day_of_week: DayOfWeek;
    open_time: string; // Formato "HH:MM"
    close_time: string; // Formato "HH:MM"
};
// ----------------------------------------------------------------

export class SettingsService {
    
    // ----------------------------------------------------------------------
    // ✅ IMPLEMENTACIÓN DEL MÉTODO FALTANTE (Resuelve el error "Method not implemented.")
    // Llama a findLocalById para obtener la configuración general.
    // ----------------------------------------------------------------------
    static async getLocalSettings(localId: string): Promise<Partial<Local> | null> {
        // Simplemente delegamos la búsqueda al método existente, ya que tiene 
        // la lógica de SELECT necesaria.
        const localSettings = await this.findLocalById(localId); 
        return localSettings;
    }

    // --- MÉTODOS EXISTENTES (Se mantienen igual) ---
    
    static async findLocalById(localId: string): Promise<Partial<Local> | null> {
        const local = await prisma.local.findUnique({
            where: { 
                id: localId 
            },
            select: { 
                id: true, 
                name: true, 
                description: true, 
                address: true, 
                phone: true, 
                email: true, 
                image_url: true,
                categorias_menu: true 
            }
        });
        
        return local;
    }

    static async updateLocalById(localId: string, data: Partial<Local>): Promise<Local | null> {
        try {
            // ... (Lógica de actualización de Local se mantiene igual)
            const updatedLocal = await prisma.local.update({
                where: { id: localId },
                data: {
                    name: data.name,
                    description: data.description,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    image_url: data.image_url,
                    categorias_menu: data.categorias_menu, 
                },
            });
            return updatedLocal;
            
        } catch (error) {
            if ((error as any).code === 'P2025') {
                return null; 
            }
            throw error;
        }
    }
    
    // --- NUEVO MÉTODO 1: Actualizar todos los horarios de un local ---

    static async updateLocalSchedules(localId: string, schedules: ScheduleInput[]): Promise<LocalSchedule[]> {
        // Usamos una transacción para garantizar que o se aplican TODOS los cambios, o ninguno.
        const transaction = await prisma.$transaction(async (tx) => {
            
            // 1. ELIMINAR todos los horarios existentes para el local
            await tx.localSchedule.deleteMany({
                where: { local_id: localId },
            });

            // 2. CREAR los nuevos horarios
            // Mapeamos y creamos las promesas de inserción
            const createPromises = schedules.map(schedule => 
                tx.localSchedule.create({
                    data: {
                        local_id: localId,
                        day_of_week: schedule.day_of_week,
                        open_time: schedule.open_time,
                        close_time: schedule.close_time,
                    },
                })
            );

            // Ejecutamos todas las inserciones
            const newSchedules = await Promise.all(createPromises);
            
            return newSchedules;
        });

        return transaction;
    }
    
    // --- NUEVO MÉTODO 2: Obtener todos los horarios de un local ---

    static async getLocalSchedules(localId: string): Promise<LocalSchedule[]> {
        const schedules = await prisma.localSchedule.findMany({
            where: { local_id: localId },
            // Opcional: ordenar por el valor del ENUM (ej: LUNES=0, MARTES=1)
            orderBy: { 
                day_of_week: 'asc' // Esto funciona si los ENUM se manejan con índices
            }
        });
        return schedules;
    }
}