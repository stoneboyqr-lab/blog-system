import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

// Admin-only dashboard
router.get("/", verifyAdmin, getDashboardStats);

export default router; 