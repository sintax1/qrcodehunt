import React from 'react';

export const defaultContext = {
    token: '',
    isAdmin: false,
    hunt: {},
    setToken: () => {},
    setAdmin: () => {},
    setHunt: () => {}
};
  
export const GlobalContext = React.createContext();