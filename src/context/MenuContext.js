"use client";

import { createContext, useContext, useState } from 'react';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  return (
    <MenuContext.Provider value={{ isMenuVisible, setIsMenuVisible }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
} 