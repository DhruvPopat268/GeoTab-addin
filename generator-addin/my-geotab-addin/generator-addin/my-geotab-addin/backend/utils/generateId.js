module.exports = function generatePaymentId() {
  const timestamp = Date.now().toString(); // current time in ms
  const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // 6-digit random number
  return 'pay_' + timestamp + randomPart;
};
