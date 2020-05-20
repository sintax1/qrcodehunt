import React from 'react';

export const defaultContext = {
    token: '',
    isAdmin: false,
    player: null,
    ws: null,
    hunt: null,
    setToken: () => {},
    setAdmin: () => {},
    setPlayer: () => {},
    setWebsocket: () => {},
    setHunt: () => {}
};
  
export const GlobalContext = React.createContext();