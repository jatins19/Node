import { Router } from 'express';
const router = Router();
import Validation from '../validation/paymentValidation.js';
import validate from '../middleware/validate.js';
import verifyToken from '../middleware/authVerify.js';

//Routes FIles
import payment from '../controllers/splitPayment.js'; 
 
// Auth Routes acceptAggriment
 router.post('/add-vendor-strip',payment.vendorAccountStrip)
 router.post('/addBankAccount',payment.addBankAccount)
 router.post('/acceptAggriment',payment.acceptAggriment)
 router.post('/delete-vendor-strip',payment.deleteVendorAccount)
 router.post('/pay',payment.stripPayment)

export default router; 