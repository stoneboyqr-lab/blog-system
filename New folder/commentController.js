
import Comment from "../models/Comment.js";

export const createComment = async(req, res) => {
    try {
        const { name, email, message, post } = req.body; 

        await Comment.create({
            name,
            email,
            message,
            post
        });

        res.status(201).json({
            message: "Comment submitted. Awaiting approval."
        });
    } catch (error) {
      console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getApprovedComments = async (req, res) => {
    try {
        const comments = await Comment
          .find({ approved: true, post: req.params.postId })
          .select("-email")
          .sort({ createdAt: -1 });

        res.json(comments);

    } catch (error) {
        res.status(500).json({ message:
            "Server error" });
    }
};

export const approveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.approved = true;
    await comment.save();

    res.json({ message: "Comment approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const Comments = await Comment.find().sort({ createdAt: -1 });
    res.json(Comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
