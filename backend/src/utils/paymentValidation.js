const isValidVPA = require('./vpaValidator');
const isValidCardNumber = require('./luhnValidator');
const detectCardNetwork = require('./cardNetwork');
const isValidExpiry = require('./expiryValidation');

module.exports = {
  isValidVPA,
  isValidCardNumber,
  detectCardNetwork,
  isValidExpiry
};
