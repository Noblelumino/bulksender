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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("./models/user"));
const connectDb_1 = __importDefault(require("./config/connectDb"));
dotenv_1.default.config();
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, connectDb_1.default)();
        // Clear existing users (optional, for dev seeding)
        yield user_1.default.deleteMany({});
        const hashedAdminPass = yield bcryptjs_1.default.hash("1234", 10);
        const hashedUserPass = yield bcryptjs_1.default.hash("1234", 10);
        const users = [
            {
                name: "Admin User",
                email: "admin@bulk.com",
                role: "admin",
                password: 1234,
            },
            {
                name: "Regular User",
                email: "user@bulk.com",
                role: "user",
                password: hashedUserPass,
            },
        ];
        yield user_1.default.insertMany(users);
        console.log("✅ Users seeded successfully!");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Error seeding users:", err);
        process.exit(1);
    }
}))();
