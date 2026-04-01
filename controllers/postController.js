
import Post from "../models/Post.js";
import slugify from "slugify";

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .populate("category", "name")
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("category", "name")
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("category", "name")
      .populate("author", "name");
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content, published, category, tags, author, excerpt } = req.body;
    const image = req.file ? req.file.filename : null;
    const slug = req.body.slug || slugify(title, { lower: true, strict: true });

    const parsedTags = Array.isArray(tags)
      ? tags
      : (typeof tags === "string" && tags.trim()
          ? (() => { try { return JSON.parse(tags); } catch { return tags.split(",").map(t => t.trim()).filter(Boolean); } })()
          : []);

    const post = await Post.create({
      title,
      slug,
      content,
      image,
      excerpt,
      published: published === true || published === "true",
      category,
      tags: parsedTags,
      author
    });

    const populatedPost = await Post.findById(post._id).populate("category", "name").populate("author", "name");
    res.status(201).json({ message: "Post added", post: populatedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true })
      .populate("category", "name")
      .populate("author", "name");
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (typeof updateData.tags === "string") {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch {
        updateData.tags = updateData.tags.split(",").map(t => t.trim()).filter(Boolean);
      }
    }

    if (req.file) {
      updateData.image = req.file.filename;
    }

    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title, { lower: true, strict: true });
    }

    if (typeof updateData.published !== "undefined") {
      updateData.published = updateData.published === true || updateData.published === "true";
    }

    const post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("category", "name")
      .populate("author", "name");

    if (!post) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated successfully", post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
