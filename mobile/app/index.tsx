import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  Button,
  Platform,
  PermissionsAndroid,
  Alert,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import BLEScanner from "@/components/BLEScanner";
import { SocketProvider, useSocket } from "@/components/SocketEmitter";
import {
  BleManagerContext,
  BleManagerProvider,
} from "../components/BleManagerContext";

const SOCKET_SERVER_URL = "https://ble-f760.onrender.com"; // Change as needed
const ROOM = "shared-room";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<{ [id: string]: string }>(
    {}
  );
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [scanTrigger, setScanTrigger] = useState(0);
  const socket = useSocket();
  const manager = React.useContext(BleManagerContext);
  const monitorSubscriptions = React.useRef<{ [id: string]: any }>({});

  useEffect(() => {
    requestBlePermissions();
    setScanTrigger((prev) => prev + 1); // Trigger initial scan on mount
    return () => {
      // Clean up all subscriptions on unmount
      Object.values(monitorSubscriptions.current).forEach((sub) => {
        if (sub && typeof sub.remove === "function") sub.remove();
      });
    };
  }, []);

  // Listen for devices from BLEScanner
  const handleDevicesUpdate = (scannedDevices: any[]) => {
    setDevices(scannedDevices);
  };

  const handleConnect = async (device: any) => {
    if (
      deviceStatus[device.id] === "connected" ||
      deviceStatus[device.id] === "connecting"
    )
      return;
    setConnectingId(device.id);
    setDeviceStatus((prev) => ({ ...prev, [device.id]: "connecting" }));
    try {
      const connectedDevice = await manager.connectToDevice(device.id, {
        autoConnect: true,
      });
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setDeviceStatus((prev) => ({ ...prev, [device.id]: "connected" }));
      socket.emitDeviceConnected(device);
      // Monitor first available characteristic
      const allServices = await connectedDevice.services();
      if (allServices.length > 0) {
        const chars = await connectedDevice.characteristicsForService(
          allServices[0].uuid
        );
        if (chars.length > 0) {
          // Clean up previous subscription if any
          if (monitorSubscriptions.current[device.id]) {
            monitorSubscriptions.current[device.id].remove();
          }
          monitorSubscriptions.current[device.id] =
            connectedDevice.monitorCharacteristicForService(
              chars[0].serviceUUID,
              chars[0].uuid,
              (error, char) => {
                if (error) {
                  setDeviceStatus((prev) => ({
                    ...prev,
                    [device.id]: "error",
                  }));
                  return;
                }
                const value = char?.value;
                // Emit device_data event
                socket.emitDeviceData(device, value, "raw");
              }
            );
        }
      }
    } catch (err) {
      setDeviceStatus((prev) => ({ ...prev, [device.id]: "disconnected" }));
      Alert.alert("Connection Error", err?.message || String(err));
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (device: any) => {
    setDeviceStatus((prev) => ({ ...prev, [device.id]: "disconnecting" }));
    try {
      await manager.cancelDeviceConnection(device.id);
      setDeviceStatus((prev) => ({ ...prev, [device.id]: "disconnected" }));
      socket.emitDeviceDisconnected(device);
      // Clean up subscription
      if (monitorSubscriptions.current[device.id]) {
        monitorSubscriptions.current[device.id].remove();
        delete monitorSubscriptions.current[device.id];
      }
    } catch (err) {
      Alert.alert("Disconnection Error", err?.message || String(err));
    }
  };

  const handleScan = () => {
    setScanTrigger((prev) => prev + 1);
  };

  const renderDevice = ({ item: device }: { item: any }) => {
    const status = deviceStatus[device.id] || "disconnected";
    return (
      <View style={styles.deviceRowCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceId}>{device.id}</Text>
          <Text style={{ color: getStatusColor(status), fontWeight: "bold" }}>
            {status === "connecting"
              ? "Connecting..."
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
        {status === "connected" ? (
          <Button
            title="Disconnect"
            onPress={() => handleDisconnect(device)}
            color="#d9534f"
            disabled={status === "disconnecting"}
          />
        ) : (
          <Button
            title={status === "connecting" ? "Connecting..." : "Connect"}
            onPress={() => handleConnect(device)}
            color="#007AFF"
            disabled={status === "connecting" || connectingId !== null}
          />
        )}
        {status === "connecting" && (
          <ActivityIndicator size="small" style={{ marginLeft: 8 }} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <Text style={styles.header}>BLE Device Scanner</Text>
      <Text
        style={{
          marginLeft: 16,
          marginBottom: 8,
          color: socket.connected ? "green" : "red",
        }}
      >
        Server: {socket.connected ? "Connected" : "Disconnected"}
      </Text>
      <View style={[styles.halfSection, { height: SCREEN_HEIGHT - 120 }]}>
        {/* Single Card for All Devices */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Devices</Text>
          <Button title="Scan for Devices" onPress={handleScan} />
        </View>
        <BLEScanner
          onDevicesUpdate={handleDevicesUpdate}
          scanTrigger={scanTrigger}
        />
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={renderDevice}
          ListEmptyComponent={
            <Text style={{ color: "#888", margin: 16 }}>No devices found.</Text>
          }
          style={{ marginTop: 8 }}
        />
      </View>
    </SafeAreaView>
  );
}

function getStatusColor(status?: string) {
  if (status === "connected") return "green";
  if (status === "reconnecting") return "orange";
  if (status === "error") return "red";
  if (status === "connecting") return "#007AFF";
  return "#888";
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 16,
    marginBottom: 0,
    color: "#222",
  },
  halfSection: {
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexShrink: 1,
    overflow: "hidden",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  deviceRowCard: {
    backgroundColor: "#f2f6fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  deviceId: {
    fontSize: 14,
    color: "#222",
    marginBottom: 2,
    fontWeight: "bold",
  },
  deviceName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
    color: "#222",
  },
});

export default function MainScreen() {
  return (
    <BleManagerProvider>
      <SocketProvider serverUrl={SOCKET_SERVER_URL} room={ROOM}>
        <BLEMainContent />
      </SocketProvider>
    </BleManagerProvider>
  );
}
