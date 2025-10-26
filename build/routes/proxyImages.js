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
// Example: express route that proxies a remote image.
// Install node-fetch or axios: npm i node-fetch@2
const express_1 = __importDefault(require("express"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const router = express_1.default.Router();
router.get("/proxy-image", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl)
            return res.status(400).send("Missing url");
        // If the URL requires auth, include credentials or use Gmail API (see below).
        const response = yield (0, node_fetch_1.default)(imageUrl, {
        // If basic public image: no headers needed.
        // If Google requires auth, you must include a valid Authorization header here (see Gmail API method).
        // headers: { Authorization: `Bearer ${process.env.GMAIL_OAUTH_TOKEN}` }
        });
        if (!response.ok)
            return res.status(response.status).send("Upstream error");
        // forward content-type
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        res.setHeader("Content-Type", contentType);
        // Allow your front-end origin to read this response
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        // Stream the body
        response.body.pipe(res);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Proxy error");
    }
}));
exports.default = router;
