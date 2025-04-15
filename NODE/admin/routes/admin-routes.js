import { Router } from 'express';
const router = Router();

//Routes FIles
import admin from '../controllers/admin.js';
import verifyToken from '../middleware/authVarify.js' 
import validates from '../middleware/validate.js';
import validation from '../validation/adminValidation.js'

// Auth Routes 
router.post('/subscription-charges', verifyToken, validates(validation.subscriptionCharges), admin.subscriptionCharges);
router.put('/payment-activation',verifyToken, validates(validation.paymentActivation),admin.paymentActivation) 

export default router; 