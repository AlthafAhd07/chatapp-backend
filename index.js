import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";
dotenv.config();

const app = express();

app.use(
  cors({
    "Access-Control-Allow-Origin": "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cookieParser());

const port = process.env.PORT || 5000;

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

app.get("/", (request, response) => {
  response.json({ msg: "socket.io connected" });
});

/** start server */
app.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});

import "./usingWebSocket.js";
