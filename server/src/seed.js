import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

await mongoose.connect(process.env.MONGO_URI);

const users = [
  { name: "Administrator", email: "admin@rowater.local", password: "Admin@123", role: "admin" },
  { name: "Sales Staff", email: "staff@rowater.local", password: "Staff@123", role: "staff" }
];

for (const u of users) {
  const hash = await bcrypt.hash(u.password, 10);
  await User.findOneAndUpdate({ email: u.email }, { ...u, password: hash }, { upsert: true, new: true });
}
console.log("Seed complete");
await mongoose.disconnect();
