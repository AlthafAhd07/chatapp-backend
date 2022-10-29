import express from "express";

const router = express.Router();
import conservationCTRL from "../controllers/conserationCTRL.js";
router.post("/specificChat", conservationCTRL.getSpecificConservation);
router.put("/updateMessage", conservationCTRL.updateMessage);
router.post("/getAllUserChats", conservationCTRL.getAllUserChats);
router.put("/updateMsgStatus", conservationCTRL.updateMsgStatus);

export default router;
