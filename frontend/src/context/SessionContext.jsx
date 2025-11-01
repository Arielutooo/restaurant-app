import React, { createContext, useState, useContext } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  const createSession = (sessionData) => {
    setSession(sessionData);
    localStorage.setItem('restaurantSession', JSON.stringify(sessionData));
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem('restaurantSession');
  };

  const loadSession = () => {
    const stored = localStorage.getItem('restaurantSession');
    if (stored) {
      setSession(JSON.parse(stored));
    }
  };

  return (
    <SessionContext.Provider 
      value={{ 
        session, 
        createSession, 
        clearSession, 
        loadSession 
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

