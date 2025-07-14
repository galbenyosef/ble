import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ serverUrl, room, children }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(serverUrl);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", room);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [serverUrl, room]);

  const emitDeviceConnected = (device) => {
    socketRef.current.emit("device_connected", {
      id: device.id,
      name: device.name,
      timestamp: Date.now(),
      room,
    });
  };

  const emitDeviceData = (device, value, unit) => {
    socketRef.current.emit("device_data", {
      id: device.id,
      value,
      unit,
      timestamp: Date.now(),
      room,
    });
  };

  const emitDeviceDisconnected = (device) => {
    socketRef.current.emit("device_disconnected", {
      id: device.id,
      timestamp: Date.now(),
      room,
    });
  };

  return (
    <SocketContext.Provider
      value={{ emitDeviceConnected, emitDeviceData, emitDeviceDisconnected }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
