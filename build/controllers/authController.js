"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.loginUser = exports.renderLogin = exports.registerUser = exports.renderRegister = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const activityLogs_1 = __importDefault(require("../models/activityLogs"));
const activityLogger_1 = require("../utils/activityLogger");
// Render register page
const renderRegister = (req, res) => {
    res.render("register", { error: null });
};
exports.renderRegister = renderRegister;
/**
 * POST /auth/register
 * Body: { name, email, password, confirmPassword, role? }
 * Renders register view on error; redirects to /dashboard on success.
 */
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, confirmPassword, role } = req.body;
        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            return res.render("register", { error: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.render("register", { error: "Passwords do not match" });
        }
        if (password.length < 6) {
            return res.render("register", { error: "Password must be at least 6 characters" });
        }
        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        // Check for existing user
        const existing = yield user_1.default.findOne({ email: normalizedEmail });
        if (existing) {
            return res.render("register", { error: "Email already in use" });
        }
        // Hash password
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
        const hashed = yield bcryptjs_1.default.hash(password, saltRounds);
        // Create user
        const user = new user_1.default({
            name: name.trim(),
            email: normalizedEmail,
            password: hashed,
            role: role === "admin" ? "admin" : "user",
        });
        yield user.save();
        // Log activity: registration
        try {
            yield activityLogs_1.default.create({
                userId: user._id,
                email: user.email,
                role: user.role,
                type: "register",
                description: `${user.name} registered.`,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
        }
        catch (logErr) {
            console.warn("ActivityLog create failed:", logErr);
        }
        // Auto-login on register (create session)
        req.session.user = {
            _id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
        };
        return res.redirect("/adminDashboard");
    }
    catch (err) {
        console.error("registerUser error:", err);
        return res.render("register", { error: "Something went wrong. Please try again." });
    }
});
exports.registerUser = registerUser;
// login section 
const renderLogin = (req, res) => {
    res.render("login", { error: null });
};
exports.renderLogin = renderLogin;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            return res.render("login", { error: "User not found" });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { error: "Incorrect password" });
        }
        // Save user session
        req.session.user = {
            _id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
        };
        // ✅ Log the login event
        yield activityLogs_1.default.create({
            userId: user._id,
            email: user.email,
            role: user.role,
            type: "login",
            description: `${user.name} logged in.`,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        //TODO: REMOVE THIS FROM HERE TO WHERE YOU NEED IT, THIS IS FOR WHEN A USER SENDS A BULK EMAIL
        // await ActivityLog.create({
        //   userId: user._id,
        //   email: user.email,
        //   role: user.role,
        //   type: "bulk_send",
        //   description: `Sent campaign "${subject}" to ${recipients.length} users.`,
        //   bulkDetails: {
        //     campaignId: campaign._id,
        //     totalRecipients: recipients.length,
        //     deliveredCount: delivered.length,
        //     failedCount: failed.length,
        //     subject,
        //     serviceUsed: "SendGrid",
        //   },
        // });
        //TODO: MOVE THIS TO YOUR LOG OUT ROUTE
        // await ActivityLog.create({
        //   userId: user._id,
        //   email: user.email,
        //   role: user.role,
        //   type: "logout",
        //   description: `${user.name} logged out.`,
        //   ipAddress: req.ip,
        // });
        res.redirect("/dashboard");
    }
    catch (err) {
        console.error(err);
        res.render("login", { error: "Something went wrong. Please try again." });
    }
});
exports.loginUser = loginUser;
const logoutUser = (req, res) => {
    const sessionUser = req.session.user;
    if (sessionUser) {
        // log logout (do not await)
        (0, activityLogger_1.logFromRequest)(req, {
            userId: sessionUser._id,
            email: sessionUser.email,
            role: sessionUser.role,
            type: "logout",
            description: `${sessionUser.name} logged out.`,
        });
    }
    req.session.destroy((err) => {
        if (err)
            console.error(err);
        res.redirect("/login");
    });
};
exports.logoutUser = logoutUser;
