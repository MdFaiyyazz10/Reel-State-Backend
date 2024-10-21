import express from 'express';
import { upload } from '../middleware/multer.js';
import { createBlog, getAllBlogs, getBlogBySlug, deleteBlogById, updateBlogById, getLatestBlogs } from '../controller/blog.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/create', adminAuth, upload, createBlog);
router.put('/update/:id', adminAuth, upload, updateBlogById);
router.get('/get-all-blog', getAllBlogs);
router.get('/get-latest-blog', getLatestBlogs);
router.get('/:slug', getBlogBySlug);
router.delete('/delete/:id', adminAuth, deleteBlogById);

export default router;