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

router.get('/all', getAllProducts);
router.get('/vendor', authentication, authorize('admin', 'vendor'), getAllProducts);
router.get('/admin', authentication, authorize('admin'), getAllProducts);
router.get('/:id', getSingleProduct);
router.get('/', getAllProducts);

router.post('/admin', authentication, authorize('admin'), createProduct);
router.patch('/admin/:id', authentication, authorize('admin'), updateProduct);
router.delete('/admin/:id', authentication, authorize('admin'), deleteProduct);

router.post('/', authentication, createProduct);
router.patch('/:id', authentication, updateProduct);
router.delete('/:id', authentication, deleteProduct);

module.exports = router;