import multer from 'multer';

const imgConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        
        cb(null, `image-${Date.now()}.${file.originalname}`);
    }
});

// img filter
const isImage = (req,file,cb) => {
    if(file.mimetype.startsWith("image")){
        cb(null,true);
    }else{
        cb(new Error("only Image is Allowed"))
    }
}

export const upload = multer({ storage: imgConfig , fileFilter: isImage }).single('image');

