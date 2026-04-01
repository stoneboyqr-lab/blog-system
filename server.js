import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import dns from "dns"

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5000",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);

  
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });