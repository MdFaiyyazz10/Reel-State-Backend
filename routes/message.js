import express from "express";
import { getAllMessage, sendMessage } from "../controller/message.js";

const router = express.Router();

router.post('/message', sendMessage); 
router.get('/get-message', getAllMessage);

export default router;
