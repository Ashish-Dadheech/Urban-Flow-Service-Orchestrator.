import React, { createContext, useState, useContext, useEffect } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertLevel, setAlertLevel] = useState('Green'); // Green, Yellow, Red

  // Calculate alert level based on incidents
  const updateAlertLevel = (activeIncidents) => {
    if (!activeIncidents || activeIncidents.length === 0) {
      setAlertLevel('Green');
    } else if (activeIncidents.length <= 2) {
      setAlertLevel('Yellow');
    } else {
      setAlertLevel('Red');
    }
  };

  const value = {
    alertLevel,
    setAlertLevel,
    updateAlertLevel,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};
