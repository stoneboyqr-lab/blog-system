import express from "express";
import {
    // register,
    login,
    logout,
    getUser,
    changePassword,
} from "../controllers/authController.js";

import { verifyAdmin } from "../middleware/verifyAdmin.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  handler: (req, res) => {
    console.warn(`⚠ Brute force attempt - IP: ${req.ip} - ${new Date().toISOString()}`);
    res.status(429).json({ message: "Too many login attempts. Try again later." });
  },
});

// router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/user", verifyAdmin, getUser);
router.post("/change-password", verifyAdmin, changePassword);

export default router;