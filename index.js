import express from "express";
import cors from "cors";
const app = express();
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

app.use(
  cors({
    "Access-Control-Allow-Origin": "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cookieParser());
let port = process.env.PORT || 5000;

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
  response.json({ msg: "mongo db connected" });
});

/** start server */
app.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});
