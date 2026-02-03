const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authentication');
const authorize = require('../middleware/authrize');

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products');

// Public and authenticated endpoints
router.get('/', getAllProducts); // Public endpoint for customers
router.get('/all', authentication, authorize('admin', 'vendor'), getAllProducts); // Only admin and vendor can see all products
router.get('/vendor', authentication, authorize('admin', 'vendor'), getAllProducts); // For backward compatibility
router.get('/admin', authentication, authorize('admin'), getAllProducts);
router.get('/:id', authentication, getSingleProduct); // Require authentication for getting single product

// Admin specific endpoints
router.post('/admin', authentication, authorize('admin'), createProduct);
router.patch('/admin/:id', authentication, authorize('admin'), updateProduct);
router.delete('/admin/:id', authentication, authorize('admin'), deleteProduct);

// General endpoints with vendor access
router.post('/', authentication, createProduct);
// Allow vendors and admins to update and delete any product
router.patch('/:id', authentication, (req, res, next) => {
  // Check if user is admin or vendor
  if (req.user.role === 'admin' || req.user.role === 'vendor') {
    next();
  } else {
    // For other roles (customers), they should not have access
    const error = new Error("You are not allowed to access this route");
    error.statusCode = 403;
    next(error);
  }
}, updateProduct);

router.delete('/:id', authentication, (req, res, next) => {
  // Check if user is admin or vendor
  if (req.user.role === 'admin' || req.user.role === 'vendor') {
    next();
  } else {
    // For other roles (customers), they should not have access
    const error = new Error("You are not allowed to access this route");
    error.statusCode = 403;
    next(error);
  }
}, deleteProduct);

module.exports = router;