import { Request, Response } from 'express';
import { createBusinessUserAndLocal } from '../services/admin.service';

export const handleCreateBusinessUserAndLocal = async (req: Request, res: Response) => {
  const { userData, businessData, localData } = req.body;

  // Validaciones básicas de los datos
  if (!userData || !userData.email || !userData.password || !businessData.name || !localData.name) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await createBusinessUserAndLocal(userData, businessData, localData);
    res.status(201).json({ message: 'Business user and local created successfully.', data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};