const Order = require('../models/Order');

let stripe = null;
let gateway = null;

if (process.env.STRIPE_SECRET_KEY) {
  const stripeLib = require('stripe');
  stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
}

if (process.env.BRAINTREE_MERCHANT_ID && process.env.BRAINTREE_PUBLIC_KEY && process.env.BRAINTREE_PRIVATE_KEY) {
  const braintree = require('braintree');
  gateway = braintree.connect({
    environment: braintree.Environment.Sandbox, 
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
  });
}

const generateClientToken = async (req, res) => {
  try {
    if (!gateway) {
      return res.status(500).json({ 
        error: 'Braintree payment processing is not configured' 
      });
    }
    
    const response = await gateway.clientToken.generate({});
    res.json({
      clientToken: response.clientToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processStripePayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe payment processing is not configured' 
      });
    }
    
    const { amount, currency = 'usd', source, orderId } = req.body;
    
    if (!amount || !source) {
      return res.status(400).json({ 
        error: 'Amount and payment source are required' 
      });
    }

    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100), 
      currency: currency,
      source: source,
      description: `Order payment for order ${orderId || 'N/A'}`
    });

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentMethod: 'stripe',
        transactionId: charge.id,
        status: 'processing'
      });
    }

    res.json({
      success: true,
      transactionId: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency,
      status: charge.status
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processBraintreePayment = async (req, res) => {
  try {
    if (!gateway) {
      return res.status(500).json({ 
        error: 'Braintree payment processing is not configured' 
      });
    }
    
    const { nonce, amount, orderId } = req.body;
    
    if (!nonce || !amount) {
      return res.status(400).json({ 
        error: 'Payment nonce and amount are required' 
      });
    }

    const saleRequest = {
      amount: amount.toFixed(2),
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true
      }
    };

    const result = await gateway.transaction.sale(saleRequest);

    if (result.success) {
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentMethod: 'braintree',
          transactionId: result.transaction.id,
          status: 'processing'
        });
      }

      res.json({
        success: true,
        transactionId: result.transaction.id,
        amount: result.transaction.amount,
        status: result.transaction.status
      });
    } else {
      res.status(400).json({ 
        error: result.message,
        details: result.errors.deepErrors()
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processPayPalPayment = async (req, res) => {
  try {
    if (!gateway) {
      return res.status(500).json({ 
        error: 'PayPal payment processing is not configured' 
      });
    }
    
    const { nonce, amount, orderId } = req.body;
    
    if (!nonce || !amount) {
      return res.status(400).json({ 
        error: 'Payment nonce and amount are required' 
      });
    }

    const saleRequest = {
      amount: amount.toFixed(2),
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true
      }
    };

    const result = await gateway.transaction.sale(saleRequest);

    if (result.success) {
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentMethod: 'paypal',
          transactionId: result.transaction.id,
          status: 'processing'
        });
      }

      res.json({
        success: true,
        transactionId: result.transaction.id,
        amount: result.transaction.amount,
        status: result.transaction.status,
        paymentMethod: 'paypal'
      });
    } else {
      res.status(400).json({ 
        error: result.message,
        details: result.errors.deepErrors()
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processCashOnDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ 
        error: 'Order ID is required' 
      });
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentMethod: 'cash-on-delivery',
      status: 'processing'
    });

    res.json({
      success: true,
      message: 'Cash on delivery order confirmed',
      orderId: orderId,
      paymentMethod: 'cash-on-delivery'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = {
      stripe: {
        enabled: !!stripe,
        name: 'Credit/Debit Card',
        description: 'Pay with your credit or debit card'
      },
      braintree: {
        enabled: !!gateway,
        name: 'Credit/Debit Card',
        description: 'Secure card payment processing'
      },
      paypal: {
        enabled: !!gateway,
        name: 'PayPal',
        description: 'Pay with your PayPal account'
      },
      'cash-on-delivery': {
        enabled: true,
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order'
      }
    };

    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { transactionId, paymentMethod } = req.body;
    
    if (!transactionId || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Transaction ID and payment method are required' 
      });
    }

    let paymentStatus;
    
    switch (paymentMethod) {
      case 'stripe':
        if (!stripe) {
          return res.status(500).json({ 
            error: 'Stripe payment processing is not configured' 
          });
        }
        const charge = await stripe.charges.retrieve(transactionId);
        paymentStatus = {
          id: charge.id,
          status: charge.status,
          amount: charge.amount / 100,
          currency: charge.currency
        };
        break;
        
      case 'braintree':
      case 'paypal':
        if (!gateway) {
          return res.status(500).json({ 
            error: 'Braintree/PayPal payment processing is not configured' 
          });
        }
        const transaction = await gateway.transaction.find(transactionId);
        paymentStatus = {
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currencyIsoCode
        };
        break;
        
      default:
        return res.status(400).json({ 
          error: 'Unsupported payment method' 
        });
    }

    res.json(paymentStatus);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateClientToken,
  processStripePayment,
  processBraintreePayment,
  processPayPalPayment,
  processCashOnDelivery,
  getPaymentMethods,
  verifyPayment
};