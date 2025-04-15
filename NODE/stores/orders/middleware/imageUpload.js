import path from 'path'
import fs from 'fs'
import multer from 'multer'

// Upload Profile Pic
const storageProduct = multer.diskStorage({
    destination: async function (req, file, cb) {
        var storeUploadPaths = './public/product_image/';
        if (!fs.existsSync(storeUploadPaths)) {
            await fs.mkdirSync(storeUploadPaths, {
                recursive: true
            });
        }
        cb(null, storeUploadPaths)
    },
    filename: function (req, file, cb) {
        // let extArray = file.mimetype.split("/");
        // let extension = extArray[extArray.length - 1];
        const extName = path.extname(file.originalname);
        const extension = extName.slice(1);    // Removing dot(.) from the extension
        cb(null, file.fieldname + '-' + Math.floor(Math.random() * 100) + '-' + Date.now() + '.' + extension)
    }
});

const uploadProdctImage = multer({
    storage: storageProduct,
    fileFilter: (req, file, cb) => {
        const whitelist = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'image/gif'];

        if (!whitelist.includes(file.mimetype)) {
            cb(null, false);
            return cb(new Error('Only .png, .jpg, .jpeg, .mov, .mp4, and .gif format allowed!'));
        }
        cb(null, true);
    }
});

export { uploadProdctImage }