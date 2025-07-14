# Bluetooth & WebSocket Integration Project

```mermaid
%% System Architecture Diagram
 graph TD;
  A["Mobile App (React Native, Expo)"] -- BLE Scan/Connect --> B["BLE Devices"]
  A -- Streams data via Socket.io --> C["Socket.io Server (Node.js, Express)"]
  C -- Relays events --> D["Web App (React)"]
  D -- Displays live device data --> E["User"]
  A -- User interacts with app --> F["User"]
  C -- Serves static web app --> D
  subgraph BLE
    B
  end
  subgraph Real-time
    C
    D
  end
  subgraph User
    E
    F
  end
```

## Overview

This project enables real-time monitoring of Bluetooth Low Energy (BLE) devices using a React Native mobile app, a Node.js Socket.io server, and a React web dashboard. The mobile app scans for, connects to, and streams data from real BLE devices to the server, which relays updates to the web app for live monitoring.

- **Mobile App:** Scan, connect, and stream data from multiple BLE devices. Emits events to the server via Socket.io.
- **Web App:** Displays live device status and data in real time, grouped by device.
- **Server:** Relays events between mobile and web clients, and serves the web app for unified deployment.

Assignment requirements and tasks are tracked in [`tasks/prd-bluetooth-websocket-integration.md`](tasks/prd-bluetooth-websocket-integration.md) and [`tasks/tasks-prd-bluetooth-websocket-integration.md`](tasks/tasks-prd-bluetooth-websocket-integration.md).

## Prerequisites

- Node.js (v14–20 recommended; v22+ not fully supported by Express 4.x)
- npm
- Expo CLI (`npm install -g expo-cli`)
- Physical BLE devices (for real BLE testing; see compatibility below)

## Project Structure

- `mobile/` — React Native (Expo) mobile app
- `web/` — React web app
- `server/` — Node.js + Socket.io server (also serves the web app)

## BLE Device Compatibility

- **Most headphones and audio devices use Classic Bluetooth, not BLE.**
- BLE is designed for low-power, low-bandwidth data (e.g., fitness trackers, sensors, beacons).
- For best results, use BLE peripherals (e.g., fitness trackers, BLE thermometers, or a BLE simulator app).
- Your headphones may not appear in BLE scans or may not expose any usable characteristics.

## Setup Instructions

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Install Dependencies

#### Mobile App

```sh
cd mobile
npm install
```

#### Web App

```sh
cd ../web
npm install
npm run build  # Build the web app for production
```

#### Server

```sh
cd ../server
npm install
```

### 3. Running the Apps

#### Start the Socket.io Server (also serves the web app)

```sh
cd server
node index.js
```

- Server runs on `http://localhost:3000` by default.
- The web app is now accessible at the same URL: `http://localhost:3000`.
- All Socket.io and API traffic is handled by the same server, avoiding CORS issues.

#### Start the Mobile App

```sh
cd ../mobile
expo start -c  # Clear cache for reliability
```

- Use a real device for BLE scanning (BLE does not work in emulators/simulators).
- Scan the QR code with Expo Go or run on a connected device.
- Grant Bluetooth and location permissions when prompted.
- The app will scan for nearby BLE devices, allow you to connect, and stream data to the server.

## Usage

- The mobile app scans for nearby BLE devices, allows manual connection, and streams data to the server.
- The web app displays live device status and data in real time.
- All communication is via a shared Socket.io room.
- The system is designed to support at least three simultaneous BLE device connections.

## Troubleshooting

- **Node.js v22+ is not fully supported by Express 4.x.** If you see errors related to `path-to-regexp`, downgrade to Node.js v20 or v18, or use Express 4.x as in this project. See [Express issue #6038](https://github.com/expressjs/express/issues/6038).
- Ensure all apps point to the correct Socket.io server URL.
- If running on a physical device, your device and computer must be on the same network.
- For CORS or network issues, check firewall and server logs.
- If the mobile app shows the default Expo screen, ensure `App.js` is set up to use your custom components and try `expo start -c`.
- BLE scanning may not show all devices; ensure your BLE device is advertising and supports BLE (not just Classic Bluetooth).
- If you see permission errors, check that you have granted all required Bluetooth and location permissions.

## License

MIT
