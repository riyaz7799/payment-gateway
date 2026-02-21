const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const isValidVPA = require('../utils/vpaValidator');
const isValidCardNumber = require('../utils/luhnValidator');
const detectCardNetwork = require('../utils/cardNetwork');
const isValidExpiry = require('../utils/expiryValidator');

/**
 * GET /api/v1/orders/:order_id/public
 * Public order fetch for checkout
 */
router.get('/api/v1/orders/:order_id/public', async (req, res) => {
  const { order_id } = req.params;

  const result = await pool.query(
    'SELECT id, amount, currency, status FROM orders WHERE id = $1',
    [order_id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND_ERROR',
        description: 'Order not found'
      }
    });
  }

  return res.status(200).json(result.rows[0]);
});

/**
 * POST /api/v1/payments/public
 * Public payment creation for checkout
 */
router.post('/api/v1/payments/public', async (req, res) => {
  const { order_id, method } = req.body;

  const orderResult = await pool.query(
    'SELECT * FROM orders WHERE id = $1',
    [order_id]
  );

  if (orderResult.rowCount === 0) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND_ERROR',
        description: 'Order not found'
      }
    });
  }

  const order = orderResult.rows[0];

  // Validate method
  if (method !== 'upi' && method !== 'card') {
    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Invalid payment method'
      }
    });
  }

  // Generate payment ID
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let paymentId = 'pay_';
  for (let i = 0; i < 16; i++) {
    paymentId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  let paymentData = {
    id: paymentId,
    order_id: order.id,
    merchant_id: order.merchant_id,
    amount: order.amount,
    currency: order.currency,
    method,
    status: 'processing'
  };

  // UPI
  if (method === 'upi') {
    const { vpa } = req.body;

    if (!vpa || !isValidVPA(vpa)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VPA',
          description: 'VPA format invalid'
        }
      });
    }

    paymentData.vpa = vpa;
  }

  // Card
  if (method === 'card') {
    const { card } = req.body;

    if (
      !card ||
      !card.number ||
      !card.expiry_month ||
      !card.expiry_year ||
      !card.cvv ||
      !card.holder_name
    ) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CARD',
          description: 'Card validation failed'
        }
      });
    }

    if (!isValidCardNumber(card.number)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CARD',
          description: 'Card validation failed'
        }
      });
    }

    if (!isValidExpiry(card.expiry_month, card.expiry_year)) {
      return res.status(400).json({
        error: {
          code: 'EXPIRED_CARD',
          description: 'Card expiry date invalid'
        }
      });
    }

    paymentData.card_network = detectCardNetwork(card.number);
    paymentData.card_last4 = card.number.slice(-4);
  }

  // Insert payment
  await pool.query(
    `
    INSERT INTO payments (
      id, order_id, merchant_id, amount, currency,
      method, status, vpa, card_network, card_last4
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [
      paymentData.id,
      paymentData.order_id,
      paymentData.merchant_id,
      paymentData.amount,
      paymentData.currency,
      paymentData.method,
      paymentData.status,
      paymentData.vpa || null,
      paymentData.card_network || null,
      paymentData.card_last4 || null
    ]
  );

  return res.status(201).json({
    id: paymentData.id,
    order_id: paymentData.order_id,
    amount: paymentData.amount,
    currency: paymentData.currency,
    method: paymentData.method,
    status: 'processing',
    created_at: new Date().toISOString()
  });
});

module.exports = router;
