const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * GET /api/v1/test/merchant
 * No authentication required
 */
router.get('/api/v1/test/merchant', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, api_key FROM merchants WHERE email = $1',
      ['test@example.com']
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Test merchant not found'
      });
    }

    const merchant = result.rows[0];

    return res.status(200).json({
      id: merchant.id,
      email: merchant.email,
      api_key: merchant.api_key,
      seeded: true
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Unable to fetch test merchant'
    });
  }
});

module.exports = router;
