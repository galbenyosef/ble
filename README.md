# Bluetooth & WebSocket Integration Project

## Overview

This project consists of:

- A React Native mobile app for scanning, connecting, and streaming data from BLE devices.
- A React web app for real-time monitoring of device data via WebSocket (Socket.io).
- A Node.js Socket.io server for relaying events between mobile and web clients, and now also serving the web app for unified deployment.

## Prerequisites

- Node.js (v14–20 recommended; v22+ not fully supported by Express 4.x)
- npm
- Expo CLI (`npm install -g expo-cli`)
- Physical BLE devices (for real BLE testing)

## Project Structure

- `mobile/` — React Native (Expo) mobile app
- `web/` — React web app
- `server/` — Node.js + Socket.io server (also serves the web app)

## Setup Instructions

### 1. Clone the Repository

```
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Install Dependencies

#### Mobile App

```
cd mobile
npm install
```

#### Web App

```
cd ../web
npm install
npm run build  # Build the web app for production
```

#### Server

```
cd ../server
npm install
```

### 3. Running the Apps

#### Start the Socket.io Server (also serves the web app)

```
cd server
node index.js
```

- Server runs on `http://localhost:3000` by default.
- The web app is now accessible at the same URL: `http://localhost:3000`.
- All Socket.io and API traffic is handled by the same server, avoiding CORS issues.

#### Start the Mobile App

```
cd ../mobile
expo start -c  # Clear cache for reliability
```

- Use a real device for BLE scanning (BLE does not work in emulators/simulators).
- Scan the QR code with Expo Go or run on a connected device.
- Ensure your `App.js` is set up to use your custom BLE and Socket.io components (see codebase for details).

## Usage

- The mobile app scans for nearby BLE devices, allows manual connection, and streams data to the server.
- The web app displays live device status and data in real time.
- All communication is via a shared Socket.io room.

## BLE Requirements

- Use real BLE devices for testing.
- Grant Bluetooth permissions on your mobile device.
- Update BLE service/characteristic UUIDs in the code if your devices use different ones.

## Troubleshooting

- **Node.js v22+ is not fully supported by Express 4.x.** If you see errors related to `path-to-regexp`, downgrade to Node.js v20 or v18, or use Express 4.x as in this project. See [Express issue #6038](https://github.com/expressjs/express/issues/6038).
- Ensure all apps point to the correct Socket.io server URL.
- If running on a physical device, your device and computer must be on the same network.
- For CORS or network issues, check firewall and server logs.
- If the mobile app shows the default Expo screen, ensure `App.js` is set up to use your custom components and try `expo start -c`.

## License

MIT
