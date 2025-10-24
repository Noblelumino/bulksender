"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Render the User Details page
router.get("/userDetails", (req, res) => {
    res.render("userDetails"); // corresponds to views/userDetails.ejs
});
exports.default = router; // ✅ Default export fixes the error
