import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
// import { BleManager } from "react-native-ble-plx";
import { BleManagerContext } from "./BleManagerContext";

const BLEScanner = ({
  onDeviceConnect,
  connectedDeviceIds = [],
  scanTrigger,
  onDevicesUpdate,
}) => {
  const manager = useContext(BleManagerContext);
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const scanTimeout = useRef(null);

  useEffect(() => {
    if (scanTrigger !== undefined) {
      startScan();
    }
    // eslint-disable-next-line
  }, [scanTrigger]);

  useEffect(() => {
    if (onDevicesUpdate) onDevicesUpdate(devices);
  }, [devices, onDevicesUpdate]);

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
    console.log("[BLEScanner] Scan started");
    manager.startDeviceScan(null, null, (err, device) => {
      if (err) {
        setError(err.message);
        setScanning(false);
        console.log("[BLEScanner] Scan error:", err.message);
        return;
      }
      if (
        device &&
        device.id &&
        device.name &&
        device.id !== "unknown" &&
        device.name !== "unknown"
      ) {
        console.log("[BLEScanner] Device found:", device.name, device.id);
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
      console.log("[BLEScanner] Scan ended");
    }, 10000);
  };

  return (
    <View style={styles.container}>
      {scanning && <ActivityIndicator style={{ margin: 10 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 0 },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  device: { padding: 12, borderBottomWidth: 1, borderColor: "#ccc", flex: 1 },
  error: { color: "red", marginVertical: 8 },
});

export default BLEScanner;
