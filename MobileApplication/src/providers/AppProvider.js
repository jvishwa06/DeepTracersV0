import React, {useState, useContext} from 'react';

const AppDataContext = React.createContext();

export function useAppData() {
  return useContext(AppDataContext);
}

export function AppDataProvider({children}) {
  const [ipAddr, setIpAddr] = useState('10.1.75.131');

  return (
    <AppDataContext.Provider
      value={{
        ipAddr,
        setIpAddr,
      }}>
      {children}
    </AppDataContext.Provider>
  );
}
