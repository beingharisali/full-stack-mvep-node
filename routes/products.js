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
router.get('/:id', getSingleProduct);

router.post('/admin', authentication, authorize('admin'), createProduct);
router.patch('/admin/:id', authentication, authorize('admin'), updateProduct);
router.delete('/admin/:id', authentication, authorize('admin'), deleteProduct);

router.post('/', authentication, createProduct);
router.patch('/:id', authentication, updateProduct);
router.delete('/:id', authentication, deleteProduct);

module.exports = router;