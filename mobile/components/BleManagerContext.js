import React, { createContext, useRef } from "react";
import { BleManager } from "react-native-ble-plx";

export const BleManagerContext = createContext(null);

export const BleManagerProvider = ({ children }) => {
  const managerRef = useRef(null);
  if (!managerRef.current) {
    managerRef.current = new BleManager();
  }
  return (
    <BleManagerContext.Provider value={managerRef.current}>
      {children}
    </BleManagerContext.Provider>
  );
};
