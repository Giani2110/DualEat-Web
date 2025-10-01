import { Request, Response } from 'express';
import { getLocals, getLocalById, updateLocal, deleteLocal } from '../services/local.service';

export const handleGetLocals = async (_req: Request, res: Response) => {
  try {
    const locals = await getLocals();
    res.status(200).json(locals);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los locales.' });
  }
};

export const handleGetLocalById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const local = await getLocalById(String(id));
    if (local) {
      res.status(200).json(local);
    } else {
      res.status(404).json({ message: 'Local no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el local.' });
  }
};

export const handleUpdateLocal = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedLocal = await updateLocal(String(id), req.body);
    res.status(200).json(updatedLocal);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Local no encontrado para actualizar.' });
  }
};

export const handleDeleteLocal = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await deleteLocal(String(id));
    res.status(200).json({ message: 'Local eliminado exitosamente.' });
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Local no encontrado para eliminar.' });
  }
};