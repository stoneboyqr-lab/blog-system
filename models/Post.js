
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  excerpt: {
    type: String,
    default: ""
  },
  published: {
    type: Boolean,
    default: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  tags: [String],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export default mongoose.model("Post", postSchema);
