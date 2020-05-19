import React from 'react';

export const defaultContext = {
    token: '',
    isAdmin: false,
    player: null,
    ws: null,
    setToken: () => {},
    setAdmin: () => {},
    setPlayer: () => {},
    setWebsocket: () => {}
};
  
export const GlobalContext = React.createContext();