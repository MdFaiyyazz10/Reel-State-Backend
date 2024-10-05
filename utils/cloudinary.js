import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const uploadOnCloudinary = async (localfilepath , folder) => {
    try {
        if (!localfilepath) return null;

        // Upload to Cloudinary
        const res = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto" , 
            folder: folder
        });

        console.log('File Uploaded Successfully', res.url);

        // Remove the locally saved file
        fs.unlinkSync(localfilepath);

        return res;
    } catch (error) {
        fs.unlinkSync(localfilepath); // Ensure local file is removed on error
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
};



export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;

        const res = await cloudinary.uploader.destroy(publicId);
        console.log('File Deleted Successfully from Cloudinary', res);
        return res;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return null;
    }
};

