import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
// import { BleManager } from "react-native-ble-plx";
import { BleManagerContext } from "./BleManagerContext";

const BLEScanner = ({ onDeviceConnect, connectedDeviceIds = [] }) => {
  const manager = useContext(BleManagerContext);
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scanTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
      if (manager) manager.stopDeviceScan();
    };
  }, [manager]);

  const startScan = async () => {
    if (manager) {
      manager.stopDeviceScan(); // Always stop previous scan
    }
    setDevices([]);
    setError(null);
    setScanning(true);
    manager.startDeviceScan(null, null, (err, device) => {
      if (err) {
        setError(err.message);
        setScanning(false);
        return;
      }
      if (
        device &&
        device.id &&
        device.name &&
        device.id !== "unknown" &&
        device.name !== "unknown"
      ) {
        setDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      }
    });
    // Stop scan after 10 seconds
    scanTimeout.current = setTimeout(() => {
      if (manager) manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  return (
    <View style={styles.container}>
      <Button
        title={scanning ? "Scanning..." : "Scan for Devices"}
        onPress={startScan}
        disabled={scanning}
      />
      {scanning && <ActivityIndicator style={{ margin: 10 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={devices}
        keyExtractor={(item) =>
          item.id || item.name || Math.random().toString()
        }
        renderItem={({ item }) => (
          <View style={styles.deviceRow}>
            <TouchableOpacity
              style={styles.device}
              onPress={() => onDeviceConnect(item)}
              disabled={connectedDeviceIds.includes(item.id)}
            >
              <Text>
                {item.name} ({item.id})
              </Text>
            </TouchableOpacity>
            <Button
              title={
                connectedDeviceIds.includes(item.id) ? "Connected" : "Connect"
              }
              onPress={() => onDeviceConnect(item)}
              disabled={connectedDeviceIds.includes(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={!scanning && <Text>No devices found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  device: { padding: 12, borderBottomWidth: 1, borderColor: "#ccc", flex: 1 },
  error: { color: "red", marginVertical: 8 },
});

export default BLEScanner;
