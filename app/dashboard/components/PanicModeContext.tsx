'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface PanicModeContextType {
  panicMode: boolean;
  triggerPanicMode: () => void;
  disablePanicMode: () => void;
}

const PanicModeContext = createContext<PanicModeContextType>({
  panicMode: false,
  triggerPanicMode: () => {},
  disablePanicMode: () => {},
});

export function PanicModeProvider({ children }: { children: React.ReactNode }) {
  const [panicMode, setPanicMode] = useState(false);

  const triggerPanicMode = useCallback(() => {
    setPanicMode(true);
  }, []);

  const disablePanicMode = useCallback(() => {
    setPanicMode(false);
  }, []);

  return (
    <PanicModeContext.Provider value={{ panicMode, triggerPanicMode, disablePanicMode }}>
      {children}
    </PanicModeContext.Provider>
  );
}

export function usePanicMode() {
  return useContext(PanicModeContext);
}