import { Router } from 'express';
const router = Router();

//Routes FIles
import product from '../controllers/products.js';
import verifyToken from '../middleware/authVarify.js'
import { uploadProdctImage, uploadItemImage } from '../middleware/imageUpload.js'
import validates from '../middleware/validate.js';
import validation from '../validation/storeValidation.js'

// Auth Routes
router.post('/create', verifyToken, uploadProdctImage.array("productImages"), validates(validation.createProduct), product.create);
router.put('/edit', verifyToken, uploadProdctImage.array("productImages"), validates(validation.editProduct), product.edit);
router.get('/list', verifyToken, validates(validation.listProduct), product.list);
router.delete('/delete', verifyToken, validates(validation.deleteProduct), product.deleteProduct);

router.post("/add-item/mediaImage", uploadItemImage.array('photos'), product.addMediaImages);

export default router; 