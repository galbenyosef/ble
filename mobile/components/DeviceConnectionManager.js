import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { BleManager } from "react-native-ble-plx";

const SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb"; // Heart Rate Service (example)
const CHARACTERISTIC_UUID = "00002a37-0000-1000-8000-00805f9b34fb"; // Heart Rate Measurement (example)

const DeviceConnectionManager = ({ device, onData, onStatusChange }) => {
  const [status, setStatus] = useState("disconnected");
  const [data, setData] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const managerRef = useRef(new BleManager());
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    if (!device) return;
    setConnecting(true);
    setStatus("connecting");
    connectToDevice();
    return () => {
      cleanup();
    };
    // eslint-disable-next-line
  }, [device]);

  const connectToDevice = async () => {
    try {
      const connectedDevice = await managerRef.current.connectToDevice(
        device.id,
        { autoConnect: true }
      );
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
    managerRef.current.cancelDeviceConnection(device.id).catch(() => {});
    managerRef.current.destroy();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Device: {device?.name} ({device?.id})
      </Text>
      <Text>Status: {status}</Text>
      {connecting && <ActivityIndicator style={{ margin: 10 }} />}
      <Text>Data: {data ? data : "No data yet"}</Text>
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
});

export default DeviceConnectionManager;
