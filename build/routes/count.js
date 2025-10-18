"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const count_1 = require("../controllers/count");
// import any auth middleware you use, e.g. requireAdmin
const router = express_1.default.Router();
router.get("/users/count", /* requireAdmin, */ count_1.getUsersCount);
router.get("/users", /* requireAdmin, */ count_1.getUsers);
exports.default = router;
