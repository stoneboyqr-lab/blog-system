
import Category from "../models/Category.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const getDashboardStats = async (req, res) => {
  try {
    const postCount = await Post.countDocuments();
    const categoryCount = await Category.countDocuments();
    const commentCount = await Comment.countDocuments();
    const publishedCount = await Post.countDocuments({ published: true });

    res.json({ postCount, categoryCount, commentCount, publishedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
