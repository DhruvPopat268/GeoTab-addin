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
  date: Date,
  credits: Number       // <-- Added credits here
});


// Add currentPlan to track the user's currently active plan
const currentPlanSchema = new mongoose.Schema({
  planId: String,
  amount: Number,
  description: String,
  date: Date,
  expiryDate: Date,
  credits: Number        // <-- Added credits here
});


const userWalletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  payments: [paymentSchema],
  purchases: [purchaseSchema],
  balance: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },

  currentPlan: currentPlanSchema  // <-- Newly added
});

module.exports = mongoose.model("UserWallet", userWalletSchema);
