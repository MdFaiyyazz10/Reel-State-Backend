import mongoose from "mongoose";
import generateSlug from "../utils/generateSlug.js"; // Adjust path as needed

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: String,
      default: "Admin", 
      required: true,
    },
    date: {
      type: Date,
      default: Date.now, 
    },
  },
  { timestamps: true }
);

blogSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = generateSlug(this.title);
  }
  next();
});

export const Blog = mongoose.model("Blog", blogSchema);
