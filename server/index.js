const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

let documentData = "";
let lastEditor = "";

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("load-document", { documentData, lastEditor });

  socket.on("send-changes", ({ delta, username }) => {
    lastEditor = username;
    socket.broadcast.emit("receive-changes", { delta, username });
  });

  socket.on("save-document", ({ documentData: newDoc, lastEditor: editor }) => {
    documentData = newDoc;
    lastEditor = editor;
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3001");
});
