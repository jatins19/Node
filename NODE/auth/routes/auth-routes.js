import { Router } from 'express';
const router = Router();

//Routes FIles
import auth from '../controllers/auth.js';
import verifyToken from '../middleware/authVarify.js'
import { uploadProfileImage } from '../middleware/imageUpload.js'
import validates from '../middleware/validate.js';
import validation from '../validation/authValidation.js'

// Auth Routes
router.post('/login', uploadProfileImage.none(), validates(validation.loginValidate), auth.login);
router.post('/signup', uploadProfileImage.none(), validates(validation.signupValidate), auth.signup);
router.post('/forgot-password/:type', uploadProfileImage.none(), validates(validation.forgotValidate), auth.forgatPassword);
router.post('/reset-password', uploadProfileImage.none(), validates(validation.resetPasswordValidate), auth.resetPassword);
router.get('/validate-token', verifyToken, uploadProfileImage.none(), validates(validation.tokenValidate), (req, res) => { return res.status(200).json({ status: true, message: true }) });
router.post('/verify-otp',uploadProfileImage.none(),  auth.varifyOtp);

export default router; 