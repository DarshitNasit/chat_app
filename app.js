const path = require("path");
const express = require("express");

const app = express();

// Static public folder
app.use(express.static(path.join(__dirname, "public")));

// Set view engine
app.set("view engine", "pug");

// http and server
const http = require("http");
const server = http.createServer(app);

// socket.io integration with app
const socket = require("socket.io");
const io = socket(server);

/*Chat Application*/
const formatMessage = require("./config/messageFormat");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getUsers,
} = require("./config/usersInfo");

// Run when user connects
io.on("connection", (socket) => {
  // new user joins a room
  socket.on("joinRoom", ({ username, room }) => {
    // Join new user to users
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome new user
    socket.emit("message", formatMessage("Bot", "Welcome to Chat App"));

    // New user comes
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("Bot", `${user.username} has joined the chat`)
      );

    // Send information of users
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getUsers(user.room),
    });
  });

  // Recieve message from user and send back
  socket.on("chat-message", (obj) => {
    io.to(obj.room).emit("message", formatMessage(obj.username, obj.message));
  });

  // User disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("Bot", `${user.username} has left the chat`)
      );

      // Send information of users
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getUsers(user.room),
      });
    }
  });
});

// Run website online
const port = 5000;
server.listen(port, () => {
  console.log(`Server is running on ${port} ...`);
});
