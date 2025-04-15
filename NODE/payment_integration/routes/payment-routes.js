import { Router } from 'express';
const router = Router();
import Validation from '../validation/paymentValidation.js';
import validate from '../middleware/validate.js';
import verifyToken from '../middleware/authVerify.js';

//Routes FIles
import payment from '../controllers/payment.js'; 
 
// Auth Routes
router.post('/add-method-type',payment.addMethodList)
router.post('/add-method',verifyToken, validate(Validation.paymentMethodValidate), payment.addMethod); 
router.get('/list',verifyToken, payment.list); 
router.post('/add-card-paypal',payment.addCardPaypal);

// paypal charges by intent rest sdk
router.post('/paypal-charges',payment.paypalCharges);
router.post('/paypal-capture',payment.paymentCapture);

// brain Tree
router.get('/client-token',payment.clientToken);
router.post('/capture-payment',payment.capturePayment);

// paypal charges by order checkout sdk
router.post('/createOrder',payment.createOrder)
router.post('/chargeByOrderID',payment.chargeByOrderID)

// Square up
router.post('/chargesViaSquarUp',payment.chargesViaSquarUp)

export default router; 