const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateMerchant = require('../middleware/auth');

/**
 * Utility function to generate order ID
 * Format: order_ + 16 alphanumeric characters
 */
function generateOrderId() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'order_';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST /api/v1/orders
 * Create Order
 */
router.post('/', authenticateMerchant, async (req, res) => {

    const { amount, currency, receipt, notes } = req.body;

    // Validation: amount
    if (!Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'amount must be at least 100'
        }
      });
    }

    const finalCurrency = currency || 'INR';

    try {
      let orderId;
      let exists = true;

      // Ensure unique order ID
      while (exists) {
        orderId = generateOrderId();
        const check = await pool.query(
          'SELECT id FROM orders WHERE id = $1',
          [orderId]
        );
        exists = check.rowCount > 0;
      }

      const insertQuery = `
        INSERT INTO orders (
          id,
          merchant_id,
          amount,
          currency,
          receipt,
          notes,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'created')
        RETURNING *
      `;

      const values = [
        orderId,
        req.merchant.id,
        amount,
        finalCurrency,
        receipt || null,
        notes || null
      ];

      const result = await pool.query(insertQuery, values);
      const order = result.rows[0];

      return res.status(201).json({
        id: order.id,
        merchant_id: order.merchant_id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
        status: order.status,
        created_at: order.created_at
      });
    } catch (err) {
      return res.status(500).json({
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'Unable to create order'
        }
      });
    }
  }
);

/**
 * GET /api/v1/orders/:order_id
 * Get Order
 */
router.get('/:order_id', authenticateMerchant, async (req, res) => {

    const { order_id } = req.params;

    try {
      const query = `
        SELECT *
        FROM orders
        WHERE id = $1 AND merchant_id = $2
      `;

      const result = await pool.query(query, [
        order_id,
        req.merchant.id
      ]);

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND_ERROR',
            description: 'Order not found'
          }
        });
      }

      const order = result.rows[0];

      return res.status(200).json({
        id: order.id,
        merchant_id: order.merchant_id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes || {},
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at
      });
    } catch (err) {
      return res.status(500).json({
        error: {
          code: 'NOT_FOUND_ERROR',
          description: 'Order not found'
        }
      });
    }
  }
);

/**
 * GET /api/v1/orders/:order_id/public
 * Public order fetch for checkout page
 */
router.get('/:order_id/public', async (req, res) => {
  const { order_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, amount, currency, status 
       FROM orders 
       WHERE id = $1`,
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
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Unable to fetch order'
      }
    });
  }
});

module.exports = router;
