const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: String,
  paypalId: String,
  amount: Number,
  date: Date
});

const purchaseSchema = new mongoose.Schema({
  planId: String, // ID or name of the plan purchased
  amount: Number,
  description: String, // e.g., "Weather API - Pro Plan"
  date: Date
});

const userWalletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  payments: [paymentSchema],
  purchases: [purchaseSchema],
  balance: { type: Number, default: 0 },   // stored balance
  credits: { type: Number, default: 0 }    // stored API credits
});

module.exports = mongoose.model("UserWallet", userWalletSchema);