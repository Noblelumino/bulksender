import express from "express";
import { getUsersCount, getUsers } from "../controllers/count";
// import any auth middleware you use, e.g. requireAdmin

const router = express.Router();

router.get("/users/count", /* requireAdmin, */ getUsersCount);
router.get("/users", /* requireAdmin, */ getUsers);

export default router;
