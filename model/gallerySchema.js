import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String, // URL for the image
        required: true,
    },
    uploadedBy: {
        type: String,
        default: "Admin",
        required: true,
    },
}, { timestamps: true });

export const Gallery = mongoose.model('Gallery', gallerySchema);
