const pool = require('../config/db');

async function authenticateMerchant(req, res, next) {
  const apiKey = req.header('X-Api-Key');
  const apiSecret = req.header('X-Api-Secret');

  // Check headers exist
  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        description: 'Invalid API credentials'
      }
    });
  }

  try {
    const query = `
      SELECT id, is_active
      FROM merchants
      WHERE api_key = $1 AND api_secret = $2
    `;

    const result = await pool.query(query, [apiKey, apiSecret]);

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          description: 'Invalid API credentials'
        }
      });
    }

    const merchant = result.rows[0];

    if (!merchant.is_active) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          description: 'Invalid API credentials'
        }
      });
    }

    // Attach merchant info to request
    req.merchant = {
      id: merchant.id
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        description: 'Invalid API credentials'
      }
    });
  }
}

module.exports = authenticateMerchant;
