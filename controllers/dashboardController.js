import Category from "../models/Category.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

const postsThisMonth = await Post.countDocuments({
  createdAt: { $gte: startOfMonth }
});
    const pendingCount = await Comment.countDocuments({ approved: false });
    const [postCount, categoryCount, commentCount, publishedCount, recentPosts, recentComments] = await Promise.all([
      Post.countDocuments(),
      Category.countDocuments(),
      Comment.countDocuments(),
      Post.countDocuments({ published: true }),
      Post.find({}).sort({ createdAt: -1 }).limit(3).select("title createdAt"),
      Comment.find({}).sort({ createdAt: -1 }).limit(2).select("name createdAt")
    ]);

    res.json({ postCount, categoryCount, commentCount, publishedCount, pendingCount, postsThisMonth, recentPosts, recentComments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
