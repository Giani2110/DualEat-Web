/* eslint-disable react-refresh/only-export-components */
// src/context/RegisterContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Define la interfaz para los datos que el contexto almacenará
// AÑADE 'tempToken?: string;' AQUÍ
interface RegisterData {
  email?: string;
  password?: string; // Solo si necesitas almacenar la contraseña temporalmente (no recomendado para producción)
  tempToken?: string; // <--- ¡AÑADE ESTO!
  name?: string;
  foodPreferences?: number[];
  communityPreferences?: number[];
  // Añade cualquier otra propiedad que tu contexto de registro necesite
}

interface RegisterContextType {
  data: RegisterData;
  updateData: (newData: Partial<RegisterData>) => void;
  clearData: () => void;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

interface RegisterProviderProps {
  children: ReactNode;
}

export const RegisterProvider: React.FC<RegisterProviderProps> = ({ children }) => {
  const [data, setData] = useState<RegisterData>({});

  const updateData = (newData: Partial<RegisterData>) => {
    setData(prevData => ({ ...prevData, ...newData }));
  };

  const clearData = () => {
    setData({});
  };

  return (
    <RegisterContext.Provider value={{ data, updateData, clearData }}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => {
  const context = useContext(RegisterContext);
  if (context === undefined) {
    throw new Error('useRegister must be used within a RegisterProvider');
  }
  return context;
};