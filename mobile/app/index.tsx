import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  Button,
  Platform,
  PermissionsAndroid,
  Alert,
  View,
} from "react-native";
import BLEScanner from "@/components/BLEScanner";
import DeviceConnectionManager from "@/components/DeviceConnectionManager";
import { SocketProvider, useSocket } from "@/components/SocketEmitter";
import { BleManagerProvider } from "../components/BleManagerContext";

const SOCKET_SERVER_URL = "http://localhost:3000"; // Change as needed
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
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [deviceStatus, setDeviceStatus] = useState<string>("disconnected");
  const socket = useSocket();

  useEffect(() => {
    requestBlePermissions();
  }, []);

  const handleDeviceSelect = (device: any) => {
    setSelectedDevice(device);
    socket.emitDeviceConnected(device);
  };

  const handleData = (data: any) => {
    setDeviceData(data);
    if (selectedDevice) {
      socket.emitDeviceData(selectedDevice, data, "raw");
    }
  };

  const handleStatusChange = (status: string) => {
    setDeviceStatus(status);
    if (status === "disconnected" && selectedDevice) {
      socket.emitDeviceDisconnected(selectedDevice);
      setSelectedDevice(null);
    }
  };

  return (
    <View style={{ flex: 1 }}>
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
    </View>
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
