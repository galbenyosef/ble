import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "https://ble-f760.onrender.com"; // Change as needed
const ROOM = "shared-room";

const statusColors = {
  connected: "green",
  disconnected: "red",
  reconnecting: "orange",
};

const DeviceList = () => {
  const [devices, setDevices] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", ROOM);
    });

    socketRef.current.on("device_connected", (data) => {
      setDevices((prev) => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          name: data.name,
          id: data.id,
          status: "connected",
          lastUpdate: Date.now(),
          lastEvent: "connected",
        },
      }));
    });

    socketRef.current.on("device_data", (data) => {
      setDevices((prev) => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          id: data.id,
          value: data.value,
          unit: data.unit,
          status: "connected",
          lastUpdate: Date.now(),
          lastEvent: "data",
        },
      }));
    });

    socketRef.current.on("device_disconnected", (data) => {
      setDevices((prev) => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          id: data.id,
          status: "disconnected",
          lastUpdate: Date.now(),
          lastEvent: "disconnected",
        },
      }));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Live Devices</h2>
      {Object.keys(devices).length === 0 && <div>No devices yet.</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {Object.values(devices).map((device) => (
          <li
            key={device.id}
            style={{
              marginBottom: 16,
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 16,
              background:
                device.lastEvent === "connected"
                  ? "#e6ffe6"
                  : device.lastEvent === "data"
                  ? "#e6f0ff"
                  : "#fff",
              transition: "background 0.5s",
            }}
          >
            <div>
              <b>Name:</b> {device.name || "Unknown"}
            </div>
            <div>
              <b>ID:</b> {device.id}
            </div>
            <div>
              <b>Status:</b>{" "}
              <span style={{ color: statusColors[device.status] || "black" }}>
                {device.status}
              </span>
            </div>
            <div>
              <b>Last Data:</b>{" "}
              {device.value ? `${device.value} ${device.unit || ""}` : "—"}
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              Last update: {new Date(device.lastUpdate).toLocaleTimeString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeviceList;
