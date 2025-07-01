const User = require('../models/UserPayment');
const generatePaymentId = require('../utils/generateId');

module.exports.recordPayment = async (req, res) => {
  try {
    const { userId, amount, paypalId } = req.body;
    const paymentId = generatePaymentId();

    const paymentData = { paymentId, amount, paypalId };

    // Step 1: Check if user exists
    let user = await User.findById(userId);

    // Step 2: If not, create user with first payment
    if (!user) {
      user = new User({
        userId,
        payments: [paymentData]
      });
      await user.save();
    } else {
      // Step 3: If exists, push payment
      user.payments.push(paymentData);
      await user.save();
    }

    res.status(200).json({ success: true, paymentId });
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({ success: false, message: 'Failed to save payment' });
  }
};