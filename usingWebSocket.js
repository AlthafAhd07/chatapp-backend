import { Server } from "socket.io";
import Users from "./models/userSchema.js";
import Conversations from "./models/conservationSchema.js";
import dotenv from "dotenv";
dotenv.config();

const CLIENT_URL = process.env.CLIENT__URL;

console.log(CLIENT_URL);

const io = new Server(5001, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  socket.avatar = socket.handshake.query.avatar;
  next();
});
let onlineUsers = [];

// function addOnlineUser(user, socket) {
//   console.log(user, socket.username);
//   socket.on("getOnlineUsers", (data) => {
//     socket.emit("addonline", "do bye");
//   });
// }

io.on("connection", async (socket) => {
  // When user connected
  const username = socket.username;

  console.log(`${username} just connected`);

  const inOnline = onlineUsers.find((e) => e.username === username);
  if (inOnline === undefined) {
    onlineUsers.unshift({ username, avatar: socket.avatar });
  }

  // updating user as online in database
  await Users.findOneAndUpdate({ username }, { online: ["true", "now"] });
  // getting users chat list
  const opponentChats = await Conversations.find(
    {
      participant: { $all: username },
    },
    { participant: 1 }
  );
  const userChatOpponents = opponentChats.map(
    (i) => i.participant.filter((name) => name !== username)[0]
  );
  const opponentUsersWhoAreOnline = onlineUsers.filter((element) => {
    return userChatOpponents.includes(element.username);
  });
  // updateThe newOnline user To others
  for (let [id, socketUser] of io.of("/").sockets) {
    if (socketUser.username !== username) {
      if (userChatOpponents.includes(socketUser.username)) {
        socketUser.emit("updateOnline", {
          username,
          avatar: socket.avatar,
        });
      }
    }
  }

  socket.on("getOnlineUsers", () => {
    socket.emit("onlineusers", opponentUsersWhoAreOnline);
  });

  // joining chat room

  socket.on("join__room", (data) => {
    socket.join(data);
    socket.join(data + "123");
    socket.join(data + "12345");
  });
  socket.on("send_message", ({ message, room, conversationId, receiver }) => {
    const rooms = io.of("/").adapter.rooms;
    const roomCount = rooms.get(room);
    if (roomCount?.size === 1) {
      if (!!onlineUsers.find((e) => e.username === receiver)) {
        console.log("user online", username);
        for (let [id, socketUser] of io.of("/").sockets) {
          if (socketUser.username === receiver) {
            socketUser.emit("updateChatList", { conversationId, message });
          }
        }
      } else {
        console.log("user not online");
        return;
      }
    } else {
      socket.to(room).emit("receive_msg", message);
    }
  });

  socket.on("sent_typer", ({ typingUser, room }) => {
    socket.to(room).emit("receive_typer", typingUser);
  });

  socket.on("msgStatus", ({ msgId, room }) => {
    socket.to(room).emit("recieveMsgStatus", msgId);
  });

  socket.on("leaveRoom", (data) => {
    socket.leave(data);
    socket.leave(data + "123");
    socket.leave(data + "12345");
  });

  // when user Disconnected
  socket.on("disconnect", async () => {
    onlineUsers = onlineUsers.filter((d) => d.username !== username);
    for (let [id, socketUser] of io.of("/").sockets) {
      if (socketUser.username !== username) {
        if (userChatOpponents.includes(socketUser.username)) {
          socketUser.emit("updateOffline", username);
        }
      }
    }
    await Users.findOneAndUpdate(
      { username },
      { online: ["false", Date.now()] }
    );
    console.log(`user ${username} disconnected`);
  });
});
