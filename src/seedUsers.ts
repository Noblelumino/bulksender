import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user";
import connectDb from "./config/connectDb";

dotenv.config();

(async () => {
  try {
    await connectDb();

    // Clear existing users (optional, for dev seeding)
    await User.deleteMany({});

    const hashedAdminPass = await bcrypt.hash("1234", 10);
    const hashedUserPass = await bcrypt.hash("1234", 10);

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

    await User.insertMany(users);
    console.log("✅ Users seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
})();
