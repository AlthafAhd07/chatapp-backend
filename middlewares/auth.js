import Users from "../models/userSchema.js";
import jwt from "jsonwebtoken";

export const Auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(400).json({ msg: "Login now" });
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) return res.status(400).json({ msg: "Login now" });

    const user = await Users.findOne({ _id: decoded.id });
    if (!user) return res.status(500).json({ msg: "User does not exists" });
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
