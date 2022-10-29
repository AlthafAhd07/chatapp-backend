import express from "express";

const router = express.Router();

import userCtrl from "../controllers/userCTRL.js";
router.get("/searchUser", userCtrl.searchUser);

export default router;
