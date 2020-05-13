import React from 'react';

export const defaultContext = {
    token: '',
    isAdmin: false,
    hunts: [{id: '1', title: 'my title'}],
    setHunts: (hunts) => {this.hunts = hunts},
    setToken: (token) => {this.token = token}
};
  
export const GlobalContext = React.createContext();