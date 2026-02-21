const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateMerchant = require('../middleware/auth');

const isValidVPA = require('../utils/vpaValidator');
const isValidCardNumber = require('../utils/luhnValidator');
const detectCardNetwork = require('../utils/cardNetwork');
const isValidExpiry = require('../utils/expiryValidator');

/**
 * Generate payment ID
 * Format: pay_ + 16 alphanumeric characters
 */
function generatePaymentId() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'pay_';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST /api/v1/payments
 */
router.post('/', authenticateMerchant, async (req, res) => {

    const { order_id, method } = req.body;

    // Fetch order
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND merchant_id = $2',
      [order_id, req.merchant.id]
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

    let paymentId;
    let exists = true;

    while (exists) {
      paymentId = generatePaymentId();
      const check = await pool.query(
        'SELECT id FROM payments WHERE id = $1',
        [paymentId]
      );
      exists = check.rowCount > 0;
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

    // ---------------- UPI ----------------
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

    // ---------------- CARD ----------------
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

    // Insert payment (status = processing)
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

    // ---------------- PROCESSING ----------------
    const testMode = process.env.TEST_MODE === 'true';
    const delay = testMode
      ? parseInt(process.env.TEST_PROCESSING_DELAY || '1000')
      : Math.floor(Math.random() * 5000) + 5000;

    await new Promise(resolve => setTimeout(resolve, delay));

    let success;
    if (testMode) {
      success = process.env.TEST_PAYMENT_SUCCESS !== 'false';
    } else {
      success =
        method === 'upi'
          ? Math.random() < 0.9
          : Math.random() < 0.95;
    }

    if (success) {
      await pool.query(
        'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['success', paymentId]
      );
    } else {
      await pool.query(
        `
        UPDATE payments
        SET status = 'failed',
            error_code = 'PAYMENT_FAILED',
            error_description = 'Payment processing failed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [paymentId]
      );
    }

    return res.status(201).json({
      id: paymentData.id,
      order_id: paymentData.order_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.method,
      vpa: paymentData.vpa,
      card_network: paymentData.card_network,
      card_last4: paymentData.card_last4,
      status: success ? 'success' : 'failed',
      created_at: new Date().toISOString()
    });
  }
);

/**
 * GET /api/v1/payments/:payment_id
 */
router.get('/:payment_id', authenticateMerchant, async (req, res) => {

    const { payment_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND merchant_id = $2',
      [payment_id, req.merchant.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          description: 'Payment not found'
        }
      });
    }

    const p = result.rows[0];

    return res.status(200).json({
      id: p.id,
      order_id: p.order_id,
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      vpa: p.vpa,
      card_network: p.card_network,
      card_last4: p.card_last4,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at
    });
  }
);

/**
 * POST /api/v1/payments/public
 * Public payment creation for checkout page
 */
router.post('/public', async (req, res) => {
  const { order_id, method, vpa, card } = req.body;

  try {
    // Fetch order (no auth)
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

    // Generate payment ID
    const paymentId = generatePaymentId();

    // Insert payment as processing
    await pool.query(
      `INSERT INTO payments
      (id, order_id, merchant_id, amount, currency, method, status, vpa)
      VALUES ($1,$2,$3,$4,$5,$6,'processing',$7)`,
      [
        paymentId,
        order.id,
        order.merchant_id,
        order.amount,
        order.currency,
        method,
        method === 'upi' ? vpa : null
      ]
    );

    // Simulate async processing
    setTimeout(async () => {
      const success =
        method === 'upi'
          ? Math.random() < 0.9
          : Math.random() < 0.95;

      await pool.query(
        `UPDATE payments
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [success ? 'success' : 'failed', paymentId]
      );
    }, 3000);

    return res.status(201).json({
      id: paymentId,
      status: 'processing'
    });

  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'PAYMENT_FAILED',
        description: 'Payment processing failed'
      }
    });
  }
});

/**
 * GET /api/v1/payments/:payment_id/public
 * Public payment status for checkout polling
 */
router.get('/:payment_id/public', async (req, res) => {
  const { payment_id } = req.params;

  const result = await pool.query(
    'SELECT id, status FROM payments WHERE id = $1',
    [payment_id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND_ERROR',
        description: 'Payment not found'
      }
    });
  }

  return res.json(result.rows[0]);
});


module.exports = router;
