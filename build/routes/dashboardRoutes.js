"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authGuard_1 = require("../middleware/authGuard");
const router = (0, express_1.Router)();
router.get("/dashboard", authGuard_1.ensureAuthenticated, (req, res) => {
    const user = req.session.user;
    res.render("dashboard", { user });
});
router.get("/adminDashboard", authGuard_1.ensureAuthenticated, (req, res) => {
    const user = req.session.user;
    res.render("adminDashboard", { user });
});
router.get("/register", authGuard_1.ensureAuthenticated, (req, res) => {
    const user = req.session.user;
    res.render("register", { user });
});
exports.default = router;
