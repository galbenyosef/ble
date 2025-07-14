# Product Requirements Document (PRD): Bluetooth & WebSocket Integration

## 1. Introduction/Overview

This project consists of two applications: a React Native mobile app and a React web app. The mobile app connects to at least three real nearby Bluetooth Low Energy (BLE) devices, retrieves live data, and streams updates to a web app using WebSocket (Socket.io) in a shared room for real-time monitoring. The web app displays live updates grouped by device for remote monitoring.

## 2. Goals

- Enable real-time monitoring of at least three physical BLE devices via a web dashboard.
- Ensure reliable BLE connections, data streaming, and reconnection handling.
- Provide a clear, responsive UI for both mobile and web apps.
- Use Socket.io for real-time event streaming between mobile and web apps.

## 3. User Stories

1. As a user, I want to see a list of nearby BLE devices so I can choose which to connect.
2. As a user, I want to connect to at least three BLE devices and view their live data.
3. As a user, I want to see real-time updates from connected devices on a web dashboard.
4. As a user, I want to be notified if a device disconnects and when it reconnects.

## 4. Functional Requirements

1. The mobile app must scan for and display a list of nearby BLE devices (name and MAC address).
2. The user must be able to manually connect to at least three physical BLE devices.
3. The app must receive and display live data streams from connected devices.
4. The app must manage disconnects and attempt automatic reconnections.
5. The app must display real-time connection status and incoming data for each device.
6. The app must emit Socket.io events to a shared room:
   - `device_connected` (device ID, name, connection timestamp)
   - `device_data` (device ID, value, unit, timestamp)
   - `device_disconnected` (device ID, disconnect timestamp; optional)
7. The web app must connect to the same Socket.io room and display incoming events grouped by device:
   - Show device name, ID, connection status, and live data
   - Highlight new connections and updates in real-time
8. The system must use a free or local Socket.io server for communication.

## 5. Non-Goals (Out of Scope)

- Device firmware updates or BLE pairing security features
- Historical data storage or analytics (real-time only)
- Control or configuration of BLE devices from the web app
- Support for non-BLE devices

## 6. Design Considerations (Optional)

- UI should be clean and responsive; no specific color scheme or mockups provided.
- Web app should be usable on desktop and mobile browsers.
- Highlight new device connections and data updates visually.

## 7. Technical Considerations (Optional)

- Use React Native CLI or Expo (bare workflow) for the mobile app.
- Use React (or HTML+JS) for the web app.
- Use any reliable BLE and Socket.io libraries compatible with React Native and React.
- Socket.io server can be run locally or on a free cloud instance.
- Clean code separation and architecture for maintainability.

## 8. Success Metrics

- The web app displays live data from at least three physical BLE devices within 5 seconds of data change.
- Automatic reconnection works within 10 seconds of disconnect.
- No mock data is used; only real BLE devices are supported.
- UI is responsive and clearly shows device status and data.

## 9. Open Questions

- What specific data types/units are expected from BLE devices?
- Should the web app support any device control features in the future?
- Are there any preferred UI/UX frameworks or design guidelines?
- Should logs be stored for debugging, or is console output sufficient?
