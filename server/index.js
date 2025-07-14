const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../web/build")));

// Socket.io and CORS setup
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("[Socket.io] Client connected:", socket.id);
  let currentRoom = null;
  socket.on("join", (room) => {
    if (currentRoom) socket.leave(currentRoom);
    currentRoom = room;
    socket.join(room);
    console.log(`[Socket.io] Client ${socket.id} joined room: ${room}`);
  });

  socket.on("device_connected", (data) => {
    console.log("[Socket.io] device_connected:", data);
    if (data.room) io.to(data.room).emit("device_connected", data);
  });
  socket.on("device_data", (data) => {
    console.log("[Socket.io] device_data:", data);
    if (data.room) io.to(data.room).emit("device_data", data);
  });
  socket.on("device_disconnected", (data) => {
    console.log("[Socket.io] device_disconnected:", data);
    if (data.room) io.to(data.room).emit("device_disconnected", data);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    // Optionally handle disconnect logic
  });
});

// Fallback to index.html for SPA routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../web/build", "index.html"));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(
    `Socket.io server and web app running on http://localhost:${PORT}`
  );
});
