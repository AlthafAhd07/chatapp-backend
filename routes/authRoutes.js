import express from "express";

import userCtl from "../controllers/authCTRL.js";

// middlewares
import { validRegister } from "../middlewares/Valid.js";
import { Auth } from "../middlewares/auth.js"; // this should be used to login protected routes

const route = express.Router();
route.post("/register", validRegister, userCtl.register);
route.post("/active", userCtl.activeAccount);
route.post("/login", userCtl.login);

route.get("/logout", Auth, userCtl.logout);

route.get("/refresh_token", userCtl.refreshToken);

// all authontication related accout creation was finished

export default route;
