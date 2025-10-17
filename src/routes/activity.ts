import express from "express";
import { getActivityLogs } from "../controllers/activityController";
// import requireAdmin from "../middleware/auth"; // uncomment if you have auth middleware

const router = express.Router();

router.get("/", /* requireAdmin, */ getActivityLogs);




export default router;
