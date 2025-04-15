import { Router } from 'express';
const router = Router();

import cartController from '../controller/cart.js';
import verifyToken from '../middleware/authVarify.js'
import validates from '../middleware/validate.js';

router.post('/create', verifyToken, cartController.addProduct);
router.put('/edit', verifyToken, cartController.updateCart);
router.get('/list', verifyToken, cartController.cartList);
router.delete('/delete', verifyToken, cartController.deleteCart);

export default router; 