import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { BleManager } from "react-native-ble-plx";

const BLEScanner = ({ onDeviceSelect }) => {
  const managerRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scanTimeout = useRef(null);

  useEffect(() => {
    managerRef.current = new BleManager();
    return () => {
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
      if (managerRef.current) {
        managerRef.current.stopDeviceScan();
        managerRef.current.destroy();
      }
    };
  }, []);

  const startScan = async () => {
    if (managerRef.current) {
      managerRef.current.stopDeviceScan(); // Always stop previous scan
    }
    setDevices([]);
    setError(null);
    setScanning(true);
    managerRef.current.startDeviceScan(null, null, (err, device) => {
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
      if (managerRef.current) managerRef.current.stopDeviceScan();
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
          <TouchableOpacity
            style={styles.device}
            onPress={() => onDeviceSelect(item)}
          >
            <Text>
              {item.name} ({item.id})
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!scanning && <Text>No devices found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  device: { padding: 12, borderBottomWidth: 1, borderColor: "#ccc" },
  error: { color: "red", marginVertical: 8 },
});

export default BLEScanner;
