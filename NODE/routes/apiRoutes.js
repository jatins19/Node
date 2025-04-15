import { Router } from 'express';
const router = Router();

router.get('/env', (req, res) => {
    res.json({ env: process.env.NODE_ENV });
});

router.get('/', (req, res) => {
    res.sendFile('index.html');
});

import authRoutes from '../auth/routes/auth-routes.js';
import userRoutes from '../user/routes/user-routes.js';
import addressRoutes from '../user/routes/address-routes.js';
import superAdminRoutes from '../superAdmin/routes/superAdmin-routes.js';
import paymentRoutes from '../payment_integration/routes/payment-routes.js';
import productRoutes from '../stores/products/routes/product-routes.js';
import adminRoutes from '../admin/routes/admin-routes.js';
// import orderRoutes from '../stores/orders/routes/order-routes.js';
import cartRoutes from '../stores/orders/routes/cart-routes.js';
import splitPayment from '../split_payment_integration/routes/split-payment-routes.js'


const defaultRoutes = [
    {
        path: "/auth",
        routes: authRoutes,
    },
    {
        path: "/profile",
        routes: userRoutes,
    },
    {
        path: "/superadmin",
        routes: superAdminRoutes,
    },
    {
        path: "/payment",
        routes: paymentRoutes,
    },
    {
        path:"/splitPayment",
        routes:splitPayment
    },
    {
        path: "/product",
        routes: productRoutes,
    },
    {
        path: "/address",
        routes: addressRoutes,
    },
    {
        path: "/admin",
        routes: adminRoutes,
    },{
        path: "/cart",
        routes: cartRoutes,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.routes);
});

export default router; 
