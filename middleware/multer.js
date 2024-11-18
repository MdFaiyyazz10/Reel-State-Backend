import multer from 'multer';

const imgConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `image-${Date.now()}-${file.originalname}`);
    }
});

const isImage = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"));
    }
}

// Define fields for multiple file uploads
export const upload = multer({
    storage: imgConfig,
    fileFilter: isImage
}).fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'panPhoto', maxCount: 1 },
    { name: 'aadhaarPhoto', maxCount: 1 },
    { name: 'cancelledCheque', maxCount: 1 }
]);

