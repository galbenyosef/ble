import React, { useEffect, useState } from "react";
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
  const [manager] = useState(new BleManager());
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

  const startScan = () => {
    setDevices([]);
    setError(null);
    setScanning(true);
    manager.startDeviceScan(null, null, (err, device) => {
      if (err) {
        setError(err.message);
        setScanning(false);
        return;
      }
      if (device && device.name && !devices.find((d) => d.id === device.id)) {
        setDevices((prev) => [...prev, device]);
      }
    });
    // Stop scan after 10 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
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
        keyExtractor={(item) => item.id}
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
