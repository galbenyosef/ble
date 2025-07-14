import React, { useState } from "react";
import { SafeAreaView, Text, Button } from "react-native";
import BLEScanner from "./components/BLEScanner";
import DeviceConnectionManager from "./components/DeviceConnectionManager";
import { SocketProvider, useSocket } from "./components/SocketEmitter";

const SOCKET_SERVER_URL = "http://localhost:3000"; // Change as needed
const ROOM = "shared-room";

function AppContent() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceData, setDeviceData] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState("disconnected");
  const socket = useSocket();

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    socket.emitDeviceConnected(device);
  };

  const handleData = (data) => {
    setDeviceData(data);
    if (selectedDevice) {
      socket.emitDeviceData(selectedDevice, data, "raw"); // 'raw' as placeholder unit
    }
  };

  const handleStatusChange = (status) => {
    setDeviceStatus(status);
    if (status === "disconnected" && selectedDevice) {
      socket.emitDeviceDisconnected(selectedDevice);
      setSelectedDevice(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", margin: 16 }}>
        BLE Device Scanner
      </Text>
      {!selectedDevice ? (
        <BLEScanner onDeviceSelect={handleDeviceSelect} />
      ) : (
        <>
          <DeviceConnectionManager
            device={selectedDevice}
            onData={handleData}
            onStatusChange={handleStatusChange}
          />
          <Button
            title="Back to Scanner"
            onPress={() => setSelectedDevice(null)}
          />
        </>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SocketProvider serverUrl={SOCKET_SERVER_URL} room={ROOM}>
      <AppContent />
    </SocketProvider>
  );
}
