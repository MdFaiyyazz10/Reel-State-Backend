import express from 'express';
import { upload } from '../middleware/multer.js'; // Import multer middleware for handling file uploads
import { createBlog, updateBlogBySlug, getAllBlogs, getBlogBySlug, deleteBlogById } from '../controller/blog.js'; // Import blog controllers
import { adminAuth } from '../middleware/adminAuth.js'; // Import admin authentication middleware

const router = express.Router();

// Route to create a new blog with a single image upload (only for admin)
router.post('/create', adminAuth, upload, createBlog);

// Route to update an existing blog by slug with a single image upload (only for admin)
router.put('/update/:slug', adminAuth, upload, updateBlogBySlug);

// Route to get all blogs (accessible to all users)
router.get('/get-all-blog', getAllBlogs);

// Route to get a blog by its slug (accessible to all users)
router.get('/:slug', getBlogBySlug);

// Route to delete a blog by ID (only for admin)
router.delete('/delete/:id', adminAuth, deleteBlogById);

export default router;
