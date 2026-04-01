
import express from "express";
import {
  getPosts,
  getAllPostsAdmin,
  createPost,
  updatePost,
  deletePost,
  getPostBySlug,
  getPostById,
} from "../controllers/postController.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/admin/all", verifyAdmin, getAllPostsAdmin);
router.get("/admin/id/:id", verifyAdmin, getPostById);
router.post("/", verifyAdmin, upload.single("image"), createPost);
router.put("/:id", verifyAdmin, upload.single("image"), updatePost);
router.delete("/:id", verifyAdmin, deletePost);
router.get("/:slug", getPostBySlug);

export default router;
