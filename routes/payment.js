const express = require('express');
const router = express.Router();
const {
  generateClientToken,
  processStripePayment,
  processBraintreePayment,
  processPayPalPayment,
  processCashOnDelivery,
  getPaymentMethods,
  verifyPayment
} = require('../controllers/payment');
const authentication = require('../middleware/authentication');

router.get('/methods', getPaymentMethods);
router.get('/braintree/token', generateClientToken);

router.post('/stripe', authentication, processStripePayment);
router.post('/braintree', authentication, processBraintreePayment);
router.post('/paypal', authentication, processPayPalPayment);
router.post('/cod', authentication, processCashOnDelivery);
router.post('/verify', authentication, verifyPayment);

module.exports = router;