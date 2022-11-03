import Users from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Access_token, Refresh_token } from "../configs/web_tokens.js";

import { validateEmail } from "../middlewares/Valid.js";
import sendMail from "../configs/sendMail.js";

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, account, password } = req.body;
      const userNameCheck = await Users.findOne({ username: name });
      if (userNameCheck)
        return res.status(400).json({ msg: "userName already taken" });
      const user = await Users.findOne({ account });
      if (user)
        return res
          .status(400)
          .json({ msg: "Email or phone number already exists" });

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = {
        username: name,
        account: account,
        password: passwordHash,
        online: [false, Date.now()],
      };
      const userNew = await new Users(newUser);

      await userNew.save();

      const refresh_token = Refresh_token({ id: userNew._id });

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 30 days
      });

      await Users.findOneAndUpdate(
        { _id: userNew._id },
        {
          rf_token: refresh_token,
        }
      );
      res.status(201).json({ msg: "Account has been created Successfully!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { account, password } = req.body;
      if (!account || !password)
        return res.status(400).json({ msg: "Please enter all fields." });
      const user = await Users.findOne({ account });
      if (!user)
        return res.status(400).json({ msg: "This account does not exists." });

      if (user.type !== "register")
        return res.status(400).json({
          msg: `This account logged in with ${user.type} please continue with ${user.type}.`,
        });

      // if user exists
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

      // const access_token = Access_token({ id: user._id });

      const refresh_token = Refresh_token({ id: user._id });

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 30 days
      });

      await Users.findOneAndUpdate(
        { _id: user._id },
        {
          rf_token: refresh_token,
        }
      );
      // const sendUser = {
      //   _id: user._id,
      //   name: user.name,
      //   avator: user.avator,
      //   role: user.role,
      //   type: user.type,
      //   account: user.account,
      // };
      res.status(200).json({
        msg: "Login Success!",
      });
      // access_token,
      // user: sendUser,
      // guru iza kuduththaru but i think it does not need
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  // refresh token concept , login rendem olunga paru
  logout: async (req, res) => {
    if (!req.user)
      return res.status(400).json({ msg: "Invalid authontication" });

    try {
      res.clearCookie("refresh_token", { path: "/api/refresh_token" });
      res.clearCookie("fbm_285488849784352", { path: "/" });
      res.clearCookie("fbsr_285488849784352", { path: "/" });
      res.clearCookie("G_AUTHUSER_H", { path: "/" });
      res.clearCookie("G_ENABLED_IDPS", { path: "/" });
      await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          rf_token: "",
        }
      );
      return res.status(200).json({ msg: "Logged out" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  refreshToken: async (req, res) => {
    try {
      // cookie la endu refresh token a edukkura
      const rf_token = req.cookies.refresh_token;

      if (!rf_token) return res.status(400).json({ msg: "Please Login now!" });

      // decode panni aza check panra
      const decoded = jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET);
      if (!decoded.id)
        return res.status(500).json({ msg: "Please Login now!" });

      // idya wechchi datawa edukkura
      const user = await Users.findOne({ _id: decoded.id }).select(
        "-password +rf_token"
      );
      if (!user)
        return res.status(500).json({ msg: "This account does not Exists" });

      // database la ulla refresh token um izuwum saryo endu pakkura
      if (rf_token !== user.rf_token) {
        res.clearCookie("refresh_token", { path: "/api/refresh_token" });
        return res.status(400).json({ msg: "Please Login now!" });
      }

      //puziya refresh token ondu create panra

      const refresh_token = Refresh_token({ id: user._id });

      // aza cookie la anuppurazoda  - database lem Save panra
      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      await Users.findOneAndUpdate(
        { _id: user._id },
        {
          rf_token: refresh_token,
        }
      );

      // final a access token create panni userkku anuppura

      const access_token = Access_token({ id: user._id });

      res.json({ access_token, user });
    } catch (error) {
      return res.status(500).json({ msg: "Invalid Authontication" });
    }
  },
  // All login and register works are finished
};

export default userCtrl;
