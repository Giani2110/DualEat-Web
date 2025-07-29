/* eslint-disable react-refresh/only-export-components */
// src/context/RegisterContext.tsx
import React, { createContext, useContext, useState } from "react";

type RegisterData = {
  email: string;
  password: string;
  name: string;
  preferences: string[];
};

type RegisterContextType = {
  data: Partial<RegisterData>;
  updateData: (newData: Partial<RegisterData>) => void;
};

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

export const RegisterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Partial<RegisterData>>({});

  const updateData = (newData: Partial<RegisterData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <RegisterContext.Provider value={{ data, updateData }}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => {
  const context = useContext(RegisterContext);
  if (!context) throw new Error("useRegister must be used within RegisterProvider");
  return context;
};
