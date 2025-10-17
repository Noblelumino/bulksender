import express from "express";
import { getMessageStats } from "../controllers/messageController";

const router = express.Router();

router.get("/stats", getMessageStats);




export default router;
