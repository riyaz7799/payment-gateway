require('dotenv').config();
const app = require('./app');
const initDb = require('./config/initDb');
const seedTestMerchant = require('./config/seedMerchant');

const PORT = process.env.PORT || 8000;

(async () => {
  await initDb();
  await seedTestMerchant();

  app.listen(PORT, () => {
    console.log(`Payment Gateway API running on port ${PORT}`);
  });
})();
