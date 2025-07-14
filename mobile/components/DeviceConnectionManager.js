import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
// import { BleManager } from "react-native-ble-plx";
import { BleManagerContext } from "./BleManagerContext";

const SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb"; // Heart Rate Service (example)
const CHARACTERISTIC_UUID = "00002a37-0000-1000-8000-00805f9b34fb"; // Heart Rate Measurement (example)

const DeviceConnectionManager = ({ device, onData, onStatusChange }) => {
  const [status, setStatus] = useState("disconnected");
  const [data, setData] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const manager = useContext(BleManagerContext);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    if (!device) return;
    setConnecting(true);
    setStatus("connecting");
    setError(null);
    connectToDevice();
    return () => {
      cleanup();
    };
    // eslint-disable-next-line
  }, [device]);

  const connectToDevice = async () => {
    try {
      const connectedDevice = await manager.connectToDevice(device.id, {
        autoConnect: true,
      });
      setStatus("connected");
      setConnecting(false);
      onStatusChange && onStatusChange("connected");
      await connectedDevice.discoverAllServicesAndCharacteristics();
      subscribeToData(connectedDevice);
      connectedDevice.onDisconnected(() => {
        setStatus("disconnected");
        onStatusChange && onStatusChange("disconnected");
        attemptReconnect();
      });
    } catch (err) {
      setStatus("disconnected");
      setConnecting(false);
      setError(err?.message || String(err));
      console.error("BLE connection error:", err);
      Alert.alert("BLE Connection Error", err?.message || String(err));
      onStatusChange && onStatusChange("disconnected");
      attemptReconnect();
    }
  };

  const subscribeToData = (connectedDevice) => {
    connectedDevice.monitorCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          setStatus("error");
          setError(error?.message || String(error));
          console.error("BLE subscription error:", error);
          Alert.alert(
            "BLE Subscription Error",
            error?.message || String(error)
          );
          onStatusChange && onStatusChange("error");
          return;
        }
        const value = characteristic?.value;
        setData(value);
        onData && onData(value);
      }
    );
  };

  const attemptReconnect = () => {
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    reconnectTimeout.current = setTimeout(() => {
      setStatus("reconnecting");
      onStatusChange && onStatusChange("reconnecting");
      connectToDevice();
    }, 3000);
  };

  const cleanup = () => {
    if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    manager.cancelDeviceConnection(device.id).catch(() => {});
    // Do not destroy the manager, as it is shared
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Device: {device?.name} ({device?.id})
      </Text>
      <Text>Status: {status}</Text>
      {connecting && <ActivityIndicator style={{ margin: 10 }} />}
      <Text>Data: {data ? data : "No data yet"}</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}
      <Button
        title="Disconnect"
        onPress={cleanup}
        disabled={status !== "connected" && status !== "reconnecting"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    margin: 16,
  },
  title: { fontWeight: "bold", marginBottom: 8 },
  error: { color: "red", marginVertical: 8 },
});

export default DeviceConnectionManager;
