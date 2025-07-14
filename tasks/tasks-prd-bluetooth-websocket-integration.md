## Relevant Files

- `mobile/App.js` - Main entry point for the React Native mobile app.
- `mobile/components/BLEScanner.js` - Component for scanning and listing BLE devices.
- `mobile/components/DeviceConnectionManager.js` - Handles device connections, reconnections, and status.
- `mobile/components/SocketEmitter.js` - Emits Socket.io events from the mobile app.
- `web/src/App.js` - Main entry point for the React web app.
- `web/src/components/DeviceList.js` - Displays devices and their live data on the web app.
- `server/index.js` - Socket.io server for real-time communication.
- `README.md` - Setup and run instructions for both apps and the server.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `BLEScanner.test.js` in the same directory as `BLEScanner.js`).
- Use `npx jest` or the appropriate test runner for each app to run tests.

## Tasks

- [ ] 1.0 Set up project structure and development environment

  - [ ] 1.1 Initialize Git repository and create `/mobile`, `/web`, and `/server` directories
  - [ ] 1.2 Set up React Native project in `/mobile` (using CLI or Expo bare workflow)
  - [ ] 1.3 Set up React project in `/web` (using Create React App or Vite)
  - [ ] 1.4 Set up basic Node.js project for Socket.io server in `/server`
  - [ ] 1.5 Add `.gitignore` and initial README.md
  - [ ] 1.6 Verify all projects run their default starter apps

- [ ] 2.0 Implement BLE device scanning and connection in the mobile app

  - [ ] 2.1 Install and configure a BLE library for React Native (e.g., `react-native-ble-plx`)
  - [ ] 2.2 Implement BLEScanner.js to scan and list nearby BLE devices (show name and MAC address)
  - [ ] 2.3 Allow user to manually select and connect to at least three devices
  - [ ] 2.4 Implement DeviceConnectionManager.js to manage connections, disconnections, and reconnections
  - [ ] 2.5 Display real-time connection status for each device
  - [ ] 2.6 Add unit tests for BLE scanning and connection logic

- [ ] 3.0 Implement real-time data streaming and Socket.io integration in the mobile app

  - [ ] 3.1 Install Socket.io client in the mobile app
  - [ ] 3.2 Implement SocketEmitter.js to emit events (`device_connected`, `device_data`, `device_disconnected`) to the server
  - [ ] 3.3 Subscribe to and read live data from connected BLE devices
  - [ ] 3.4 Emit `device_connected` event when a device connects (with ID, name, timestamp)
  - [ ] 3.5 Emit `device_data` event when new data is received (with ID, value, unit, timestamp)
  - [ ] 3.6 Emit `device_disconnected` event when a device disconnects (with ID, timestamp)
  - [ ] 3.7 Add unit tests for Socket.io event emission

- [ ] 4.0 Implement the Socket.io server for event relaying

  - [ ] 4.1 Set up a basic Socket.io server in `/server/index.js`
  - [ ] 4.2 Implement shared room logic for all clients
  - [ ] 4.3 Relay events from mobile app to all connected web clients
  - [ ] 4.4 Add logging for connections, disconnections, and events
  - [ ] 4.5 Add unit/integration tests for server event relaying

- [ ] 5.0 Implement the React web app for real-time device monitoring

  - [ ] 5.1 Install Socket.io client in the web app
  - [ ] 5.2 Implement DeviceList.js to display devices, status, and live data
  - [ ] 5.3 Group incoming events by device (show name, ID, status, data, timestamp)
  - [ ] 5.4 Highlight new connections and data updates in real-time
  - [ ] 5.5 Make the UI responsive for desktop and mobile browsers
  - [ ] 5.6 Add unit tests for DeviceList and event handling

- [ ] 6.0 Documentation and demo (README, optional video)
  - [ ] 6.1 Write setup and run instructions for all parts in README.md
  - [ ] 6.2 (Optional) Record a short demo video showing scanning, connecting, and live updates
  - [ ] 6.3 Review and clean up code, comments, and documentation
