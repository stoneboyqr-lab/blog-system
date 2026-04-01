import * as dotenv from "dotenv";
dotenv.config();
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import User from "../models/User.js";

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

async function createAdmin() {
  const existing = await User.findOne({ email: "admin@blog.com" });
  if (existing) {
    console.log("Admin already exists");
    await mongoose.connection.close();
    return;
  }

  await User.create({
    name: "Livingstone",
    email: "admin@blog.com",
    password: "admin123"
  });

  console.log("Admin created successfully");
  await mongoose.connection.close();
}

createAdmin();


