const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: String,
  amount: Number,
  paypalId: String,
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  userId: String,
  payments: [paymentSchema]
});

module.exports = mongoose.model('User', userSchema);