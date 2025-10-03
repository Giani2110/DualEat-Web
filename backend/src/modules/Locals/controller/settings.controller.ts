// settings/settings.controller.ts

import { Request, Response } from "express";
import { SettingsService } from "../service/settings.service";
import { DayOfWeek } from "@prisma/client"; // Importamos el Enum

export class SettingsController {
    
    static async getLocalSettings(req: Request, res: Response) {
        try {
            const localId = req.params.localId; 

            if (!localId || typeof localId !== "string") {
                return res.status(400).json({ error: "Invalid localId provided" });
            }

            // Llamada al servicio para obtener la configuración
            const localSettings = await SettingsService.getLocalSettings(localId); 
            
            if (!localSettings) {
                // Si el local no se encuentra, devolvemos 404 (Not Found)
                return res.status(404).json({ error: "Local not found." });
            }
            
            return res.status(200).json(localSettings);

        } catch (error: any) {
            console.error("Error fetching local settings:", error);
            // Devolvemos 500, incluyendo el mensaje del error si no queremos que sea genérico
            return res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }
    
    static async getLocalSchedules(req: Request, res: Response) {
        try {
            const localId = req.params.localId; 

            if (!localId || typeof localId !== "string") {
                return res.status(400).json({ error: "Invalid localId provided" });
            }

            const schedules = await SettingsService.getLocalSchedules(localId); 
            
            // Si no hay horarios, devolvemos un array vacío, no 404.
            return res.status(200).json(schedules);

        } catch (error: any) {
            console.error("Error fetching local schedules:", error);
            return res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }

    static async updateLocalSchedules(req: Request, res: Response) {
        try {
            const localId = req.params.localId;
            const schedules = req.body; 

            if (!localId || typeof localId !== "string") {
                return res.status(400).json({ error: "Invalid localId provided" });
            }
            
            // 🚨 Validación básica: debe ser un array
            if (!Array.isArray(schedules)) {
                return res.status(400).json({ error: 'Expected an array of schedules in the request body.' });
            }

            // 🚨 Validación de estructura y valores del Enum
            const dayOfWeekValues = Object.values(DayOfWeek);
            const isValid = schedules.every(s => 
                dayOfWeekValues.includes(s.day_of_week) && 
                typeof s.open_time === 'string' && 
                typeof s.close_time === 'string'
            );

            if (!isValid) {
                // Incluimos los valores esperados para ayudar al desarrollador del frontend
                return res.status(400).json({ 
                    error: 'Schedule array contains invalid structure or day_of_week values.',
                    expected_days: dayOfWeekValues 
                });
            }

            // Llamamos al Service para reemplazar los horarios
            const updatedSchedules = await SettingsService.updateLocalSchedules(localId, schedules);
            
            return res.status(200).json({ 
                message: "Horarios actualizados exitosamente.", 
                schedules: updatedSchedules 
            });

        } catch (error: any) {
            console.error("Error updating local schedules:", error);
            return res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }

    static async updateLocalSettings(req: Request, res: Response) {
        try {
            const localId = req.params.localId;
            const data = req.body;
    
            if (!localId || typeof localId !== "string") {
                return res.status(400).json({ error: "Invalid localId provided" });
            }
    
            // Validación básica
            if (!data || typeof data !== 'object') {
                return res.status(400).json({ error: "Invalid data provided" });
            }
    
            // Llamada al servicio para actualizar
            const updatedLocal = await SettingsService.updateLocalById(localId, data);
            
            if (!updatedLocal) {
                return res.status(404).json({ error: "Local not found." });
            }
            
            return res.status(200).json(updatedLocal);
    
        } catch (error: any) {
            console.error("Error updating local settings:", error);
            return res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }
}