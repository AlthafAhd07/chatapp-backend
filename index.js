import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "*",
    "Access-Control-Allow-Origin": "*",
  })
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

const PORT = process.env.PORT || 5000;
const CLIENT__URL = process.env.CLIENT__URL;

mongoose.connect(
  `${process.env.MONGODB_URI}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("MongoDb connected");
  }
);

import ConservationRoutes from "./routes/conservationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (request, response) => {
  response.json({ msg: "socket.io in separate file" });
});

app.use("/api", ConservationRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);

import { Server } from "socket.io";
import Users from "./models/userSchema.js";
import Conversations from "./models/conservationSchema.js";
import http from "http";

const server = http.Server(app);

server.listen(PORT, () => {
  console.log(`Server listning on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: CLIENT__URL,
  },
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("invalid connection"));
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded.id) {
      return next(new Error("invalid connection"));
    }

    const user = await Users.findById(decoded.id);

    if (!user) {
      return next(new Error("User does not exists"));
    }
    socket.username = user.username;
    socket.avatar = user.avator;
    next();
  } catch (error) {
    return next(new Error("invalid connection"));
  }
});
let onlineUsers = [];

io.on("connection", async (socket) => {
  // When user connected
  const username = socket.username;

  console.log(`${username} just connected`);

  // updating the user to online users list
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
  socket.emit("onlineusers", opponentUsersWhoAreOnline);

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
