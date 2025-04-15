import { Router } from 'express';
import verifyToken from '../middleware/authVarify.js'
import { uploadProfileImage } from '../middleware/imageUpload.js'
import validates from '../middleware/validate.js';
import validation from '../validation/addressValidation.js'
const router = Router();

//Routes FIles
import address from '../controllers/address.js';

// Address Routes
router.post('/create', verifyToken, uploadProfileImage.none(), validates(validation.addAddress), address.addAddress);
router.put('/edit/:address_id', verifyToken, uploadProfileImage.none(), validates(validation.addAddress), address.editAddress);
router.delete('/delete/:address_id', validates(validation.getAddress), address.deleteAddress);
router.get('/', verifyToken, validates(validation.deleteAddress), address.getAddress);

export default router;