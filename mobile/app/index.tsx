import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  Button,
  Platform,
  PermissionsAndroid,
  Alert,
  ScrollView,
} from "react-native";
import BLEScanner from "@/components/BLEScanner";
import DeviceConnectionManager from "@/components/DeviceConnectionManager";
import { SocketProvider, useSocket } from "@/components/SocketEmitter";
import { BleManagerProvider } from "../components/BleManagerContext";

const SOCKET_SERVER_URL = "http://10.0.0.23:3000"; // Change as needed
const ROOM = "shared-room";

async function requestBlePermissions() {
  if (Platform.OS === "android") {
    try {
      if (Platform.Version >= 31) {
        // Android 12+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        const allGranted = Object.values(granted).every(
          (v) => v === PermissionsAndroid.RESULTS.GRANTED
        );
        if (!allGranted) {
          Alert.alert(
            "Permission required",
            "Bluetooth and location permissions are required for BLE."
          );
        }
      } else {
        // Android <12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permission required",
            "Location permission is required for BLE."
          );
        }
      }
    } catch (err) {
      Alert.alert("Permission error", "Failed to request permissions: " + err);
    }
  }
}

function BLEMainContent() {
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<{ [id: string]: any }>({});
  const [deviceStatus, setDeviceStatus] = useState<{ [id: string]: string }>(
    {}
  );
  const socket = useSocket();

  useEffect(() => {
    requestBlePermissions();
  }, []);

  const handleDeviceConnect = (device: any) => {
    if (!connectedDevices.find((d) => d.id === device.id)) {
      setConnectedDevices((prev) => [...prev, device]);
      socket.emitDeviceConnected(device);
    }
  };

  const handleData = (deviceId: string, data: any) => {
    setDeviceData((prev) => ({ ...prev, [deviceId]: data }));
    const device = connectedDevices.find((d) => d.id === deviceId);
    if (device) {
      socket.emitDeviceData(device, data, "raw");
    }
  };

  const handleStatusChange = (deviceId: string, status: string) => {
    setDeviceStatus((prev) => ({ ...prev, [deviceId]: status }));
    if (status === "disconnected") {
      const device = connectedDevices.find((d) => d.id === deviceId);
      if (device) {
        socket.emitDeviceDisconnected(device);
        setConnectedDevices((prev) => prev.filter((d) => d.id !== deviceId));
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", margin: 16 }}>
        BLE Device Scanner
      </Text>
      <Text
        style={{
          marginLeft: 16,
          marginBottom: 8,
          color: socket.connected ? "green" : "red",
        }}
      >
        Server: {socket.connected ? "Connected" : "Disconnected"}
      </Text>
      <BLEScanner
        onDeviceConnect={handleDeviceConnect}
        connectedDeviceIds={connectedDevices.map((d) => d.id)}
      />
      <ScrollView>
        {connectedDevices.map((device) => (
          <DeviceConnectionManager
            key={device.id}
            device={device}
            onData={(data) => handleData(device.id, data)}
            onStatusChange={(status) => handleStatusChange(device.id, status)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function MainScreen() {
  return (
    <BleManagerProvider>
      <SocketProvider serverUrl={SOCKET_SERVER_URL} room={ROOM}>
        <BLEMainContent />
      </SocketProvider>
    </BleManagerProvider>
  );
}
