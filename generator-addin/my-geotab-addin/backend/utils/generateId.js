module.exports = function generatePaymentId() {
  return 'pay_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
};
