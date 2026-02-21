const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/health', async (req, res) => {
  let dbStatus = 'connected';

  try {
    await pool.query('SELECT 1');
  } catch (error) {
    dbStatus = 'disconnected';
  }

  res.status(200).json({
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
