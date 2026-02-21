function isValidExpiry(month, year) {
  const m = parseInt(month);
  let y = parseInt(year);

  if (m < 1 || m > 12) return false;

  if (year.length === 2) {
    y = 2000 + y;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;

  return true;
}

module.exports = isValidExpiry;
