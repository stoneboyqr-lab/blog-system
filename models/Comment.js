import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String },

  post:{ type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },

  message: { type: String, required: true },

  approved: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);




