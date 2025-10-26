"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const proxyImages_1 = __importDefault(require("./routes/proxyImages")); // adjust path as needed
const connectDb_1 = __importDefault(require("./config/connectDb"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const bulkEmailRoutes_1 = __importDefault(require("./routes/bulkEmailRoutes"));
const count_1 = __importDefault(require("./routes/count"));
const activity_1 = __importDefault(require("./routes/activity"));
const userDetails_1 = __importDefault(require("./routes/userDetails"));
const messages_1 = __importDefault(require("./routes/messages"));
const campaign_1 = __importDefault(require("./routes/campaign"));
dotenv_1.default.config();
(0, connectDb_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// ---------- MIDDLEWARES ----------
app.use((0, cors_1.default)({
    credentials: true,
    origin: [process.env.FRONTEND_ORIGIN || "http://localhost:3000"],
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
// Log incoming content-length for debugging 413 issues (optional — remove in production)
app.use((req, _res, next) => {
    const length = req.headers['content-length'];
    if (length)
        console.log(`📦 Incoming content-length: ${length} bytes`);
    next();
});
// ✅ Sessions
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
}));
// other middleware...
app.use("/", proxyImages_1.default);
// ✅ Make user and message available to all views
app.use((req, res, next) => {
    var _a, _b, _c;
    res.locals.message = ((_a = req.session) === null || _a === void 0 ? void 0 : _a.message) || null;
    if ((_b = req.session) === null || _b === void 0 ? void 0 : _b.message)
        delete req.session.message;
    res.locals.user = ((_c = req.session) === null || _c === void 0 ? void 0 : _c.user) || null;
    next();
});
app.use("/api/bulkemail", bulkEmailRoutes_1.default);
// ---------- VIEW ENGINE ----------
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// ---------- ROUTES ----------
// 🏠 Default route → redirect to login
app.get("/", (req, res) => {
    return res.redirect("/login");
});
// Mount API routes
app.use("/api/bulkemail", campaign_1.default);
// 🧭 Mount modular routes (recommended order)
app.use("/", authRoutes_1.default);
app.use(dashboardRoutes_1.default);
app.use("/api/admin", count_1.default);
app.use("/api/admin/activity", activity_1.default);
app.use("/", userDetails_1.default);
app.use("/api/admin/messages", messages_1.default);
// Logout & 404
app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});
// ---------- FALLBACK ----------
app.all("*", (req, res) => {
    res.status(404).send("Page not found");
});
// ---------- START SERVER ----------
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
