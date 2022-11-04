import express from "express";
import { Auth } from "../middlewares/auth.js";
const router = express.Router();
import conservationCTRL from "../controllers/conserationCTRL.js";
router.post("/specificChat", Auth, conservationCTRL.getSpecificConservation);
router.put("/updateMessage", Auth, conservationCTRL.updateMessage);
router.post("/getAllUserChats", Auth, conservationCTRL.getAllUserChats);
router.put("/updateMsgStatus", Auth, conservationCTRL.updateMsgStatus);

export default router;
