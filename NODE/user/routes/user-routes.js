import { Router } from 'express';
import verifyToken from '../middleware/authVarify.js'
import { uploadProfileImage } from '../middleware/imageUpload.js'
import validates from '../middleware/validate.js';
import validation from '../validation/userValidation.js'
const router = Router();

//Routes FIles
import user from '../controllers/user.js';

// user Routes
router.put('/edit', verifyToken, uploadProfileImage.single('profile_pic'), validates(validation.editUserValidate), user.editProfile);
router.get('/', verifyToken, validates(validation.getUserValidate), user.myProfile);
router.get('/single-user', verifyToken, validates(validation.getUserValidate), user.singleUser);
router.put('/changePassword', verifyToken, uploadProfileImage.none(), validates(validation.changePasswordValidate), user.passwordChange);

// wishlist
router.get('/wishlist', verifyToken, user.userWishlist);
router.put('/add-Wishlist', verifyToken, user.wishlist);
router.delete('/delete-Wishlist/:id', verifyToken, user.wishlist);

// Notification
router.get('/notifications', verifyToken, user.getNotifications)
export default router; 