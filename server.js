const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const dotenv = require("dotenv").config();
const ACTIONS = require("./socket/Actions");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const userSockerMap = {};

app.get("/", (req, res) => {
  res.status(200).json({
    message: "CodeMirror",
    desc: "CodeMirror is a code editor implemented in JavaScript for the browser. It is mostly used for text editing in web browsers, but it can also be used to provide a code editor for other applications.",
  });
});

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSockerMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSockerMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("disconnecting", () => {
    const room = [...socket.rooms];
    room.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSockerMap[socket.id],
      });
    });
    delete userSockerMap[socket.id];
    socket.leave();
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ code, socketId }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });
});

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Listening on port ${port}`));
