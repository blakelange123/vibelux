'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  data: any;
  updateData: (data: any) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageContextProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<any>(null);

  const updateData = (newData: any) => {
    setData(newData);
  };

  return (
    <LanguageContext.Provider value={{ data, updateData }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageContextProvider');
  }
  return context;
}
