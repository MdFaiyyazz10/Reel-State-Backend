import express from 'express';
import { upload } from '../middleware/multer.js'; // Import multer middleware for handling file uploads
import { createGalleryItem, getAllGalleryItems, getGalleryItemById, updateGalleryItemById, deleteGalleryItemById, getAllGallery } from '../controller/gallery.js'; // Import gallery controllers
import { adminAuth } from '../middleware/adminAuth.js'; // Import admin authentication middleware

const router = express.Router();

// Route to create a new gallery item (only for admin)
router.post('/create', adminAuth, upload, createGalleryItem);

// Route to get all gallery items (accessible to all users)
router.get('/get-all-gallery', getAllGalleryItems);
router.get('/all-gallery', getAllGallery);

// Route to get a gallery item by ID (accessible to all users)
router.get('/:id', getGalleryItemById);

// Route to update a gallery item by ID (only for admin)
router.put('/update/:id', adminAuth, upload, updateGalleryItemById);

// Route to delete a gallery item by ID (only for admin)
router.delete('/delete/:id', adminAuth, deleteGalleryItemById);

export default router;
