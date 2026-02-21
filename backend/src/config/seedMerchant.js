const pool = require('./db');

async function seedTestMerchant() {
  const checkQuery = `
    SELECT id FROM merchants WHERE email = $1
  `;

  const insertQuery = `
    INSERT INTO merchants (
      id,
      name,
      email,
      api_key,
      api_secret,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
  `;

  const merchantValues = [
    '550e8400-e29b-41d4-a716-446655440000',
    'Test Merchant',
    'test@example.com',
    'key_test_abc123',
    'secret_test_xyz789'
  ];

  const result = await pool.query(checkQuery, ['test@example.com']);

  if (result.rowCount === 0) {
    await pool.query(insertQuery, merchantValues);
    console.log('Test merchant seeded');
  } else {
    console.log('Test merchant already exists');
  }
}

module.exports = seedTestMerchant;
