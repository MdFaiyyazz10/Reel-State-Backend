import { Gallery } from '../model/gallerySchema.js'; 
import { uploadOnCloudinary } from '../utils/cloudinary.js'; // Adjust path as needed

// Create a new gallery item
export const createGalleryItem = async (req, res) => {
    try {
        const { title } = req.body;
        const localFilePath = req.file.path; // Assuming you're using multer to upload images

        // Upload image to Cloudinary
        const uploadResult = await uploadOnCloudinary(localFilePath, 'gallery');
        const image = uploadResult.url; // Get the image URL from Cloudinary

        const galleryItem = new Gallery({ title, image });
        await galleryItem.save();
        res.status(201).json({ message: 'Gallery item created successfully', galleryItem });
    } catch (error) {
        res.status(500).json({ message: 'Error creating gallery item', error });
    }
};




// Get a gallery item by ID
export const getGalleryItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const galleryItem = await Gallery.findById(id);

        if (!galleryItem) {
            return res.status(404).json({ message: 'Gallery item not found' });
        }

        res.status(200).json(galleryItem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery item', error });
    }
};


// Update a gallery item by ID
export const updateGalleryItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        let image;

        if (req.file) {
            const localFilePath = req.file.path; // Assuming you're using multer to upload images
            // Upload new image to Cloudinary
            const uploadResult = await uploadOnCloudinary(localFilePath, 'gallery');
            image = uploadResult.url; // Get the new image URL from Cloudinary
        }

        const updatedGalleryItem = await Gallery.findByIdAndUpdate(
            id,
            { title, image }, 
            { new: true, runValidators: true }
        );

        if (!updatedGalleryItem) {
            return res.status(404).json({ message: 'Gallery item not found' });
        }

        res.status(200).json({ message: 'Gallery item updated successfully', updatedGalleryItem });
    } catch (error) {
        res.status(500).json({ message: 'Error updating gallery item', error });
    }
};




// Get all gallery items
export const getAllGalleryItems = async (req, res) => {
    try {
        const galleryItems = await Gallery.find().sort({ createdAt: -1 }); // Sort by latest first
        res.status(200).json(galleryItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery items', error });
    }
};









// Delete a gallery item by ID
export const deleteGalleryItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedGalleryItem = await Gallery.findByIdAndDelete(id);

        if (!deletedGalleryItem) {
            return res.status(404).json({ message: 'Gallery item not found' });
        }

        res.status(200).json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting gallery item', error });
    }
};