import { Router } from 'express';
const router = Router();

//Routes FIles
import superAdmin from '../controllers/superAdmin.js';
import verifyToken from '../middleware/authVarify.js';
import validationShema from '../validation/superAdminValidation.js';
import validates from '../middleware/validate.js';
import { uploadProfileImage, uploadCategoryImage } from '../middleware/imageUpload.js'
// import check from '../migration/adminSetup.js';

// Subscription Routes
router.post('/add-subscription', verifyToken, uploadProfileImage.none(), validates(validationShema.subscriptionValidation), superAdmin.addSubscription);
router.get('/view-subscription/:id', verifyToken, uploadProfileImage.none(), validates(validationShema.adminDeleteValidation), superAdmin.viewSubscription);
router.put('/update-subscription/:id', verifyToken, uploadProfileImage.none(), validates(validationShema.subscriptionValidation), superAdmin.updateSubscription);
router.delete('/delete-subscription/:id', verifyToken, uploadProfileImage.none(), validates(validationShema.adminDeleteValidation), superAdmin.deleteSubscription);
router.get('/list/:type', verifyToken, superAdmin.getList);

// Admin Routes
router.get('/admin-list', verifyToken, superAdmin.adminList);
router.post('/create-admin', verifyToken, uploadProfileImage.none(), validates(validationShema.adminValidate), superAdmin.addAdmin);
router.get('/view-admin/:id', verifyToken, uploadProfileImage.none(), validates(validationShema.adminDeleteValidation), superAdmin.viewAdmin);
router.put('/update-admin/:id', verifyToken, uploadProfileImage.single('profile_pic'), superAdmin.updateAdmin);
router.delete('/delete-admin/:id', verifyToken, uploadProfileImage.none(), validates(validationShema.adminDeleteValidation), superAdmin.deleteAdmin);
router.put('/set-payment-method', verifyToken, uploadProfileImage.none(), validates(validationShema.paymentMethodValidation), superAdmin.setPaymentMethod)

// User Route
router.post('/create-user', verifyToken, superAdmin.createUser);
router.put('/edit-user', verifyToken, superAdmin.editUser);
router.get('/user-list', verifyToken, superAdmin.getUser);
router.delete('/delete-user/:id', verifyToken, validates(validationShema.adminDeleteValidation), superAdmin.deleteUser);

// Products
router.post('/create-product', verifyToken, superAdmin.createProducts);
router.put('/edit-product', verifyToken, superAdmin.editProducts);
router.get('/my-products', verifyToken, superAdmin.listProduct);
router.get('/single-product', verifyToken, superAdmin.singleProduct);
router.delete('/delete-product', verifyToken, superAdmin.deleteProduct);

// Category
router.get('/list-category', verifyToken, superAdmin.getListCategory);
router.post('/add-category', verifyToken, uploadCategoryImage.single('category_image'), validates(validationShema.addCategory), superAdmin.addCategory);
router.get('/view-category/:id', verifyToken, uploadCategoryImage.none(), validates(validationShema.adminDeleteValidation), superAdmin.viewCategory);
router.get('/view-categories-detail/:id', verifyToken, uploadCategoryImage.none(), validates(validationShema.adminDeleteValidation), superAdmin.viewCategoriesDetail);
router.put('/update-category/:id', verifyToken, uploadCategoryImage.single('category_image'), superAdmin.updateCategory);
router.delete('/delete-subtype/:id', verifyToken, uploadCategoryImage.none(), validates(validationShema.adminDeleteValidation), superAdmin.deleteCategory);
router.delete('/delete-subcategory/:id', verifyToken, uploadCategoryImage.none(), validates(validationShema.adminDeleteValidation), superAdmin.deleteSubcategory);

export default router; 