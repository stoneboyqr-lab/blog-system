import express from "express";
import { 
    createComment, 
    getApprovedComments,
    approveComment,
    deleteComment,
    getAllComments
     } from "../controllers/commentController.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.post("/", createComment);
router.get("/", verifyAdmin, getAllComments);
router.get("/approved/:postId", getApprovedComments);
router.put("/:id", verifyAdmin, approveComment);
router.delete("/:id", verifyAdmin, deleteComment);

export default router;