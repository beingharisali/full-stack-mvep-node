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

router.get('/', getAllProducts);
router.get('/all', authentication, authorize('admin', 'vendor'), getAllProducts); 
router.get('/vendor', authentication, authorize('admin', 'vendor'), getAllProducts); 
router.get('/admin', authentication, authorize('admin'), getAllProducts);
router.get('/:id', authentication, getSingleProduct); 

router.post('/admin', authentication, authorize('admin'), createProduct);
router.patch('/admin/:id', authentication, authorize('admin', 'vendor'), updateProduct);
router.delete('/admin/:id', authentication, authorize('admin', 'vendor'), deleteProduct);

router.post('/', authentication, createProduct);
router.patch('/:id', authentication, authorize('admin', 'vendor'), updateProduct);
router.delete('/:id', authentication, authorize('admin', 'vendor'), deleteProduct);

module.exports = router;