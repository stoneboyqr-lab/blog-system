import express from "express";
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    updateCategory,
} from "../controllers/categoryController.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", verifyAdmin, createCategory);
router.put("/:id", verifyAdmin, updateCategory);
router.delete("/:id", verifyAdmin, deleteCategory);

export default router;