import express from "express";
import cors from "cors";
const app = express();
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

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

app.get("/", (request, response) => {
  response.json({ msg: "this is from frustrated althaf" });
});

/** start server */
app.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});
