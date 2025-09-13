const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: String,
  paypalId: String,
  amount: Number,
  date: Date
}, { timestamps: true });

const purchaseSchema = new mongoose.Schema({
  planId: String, // ID or name of the plan purchased
  amount: Number,
  name: String, // e.g., "Weather API - Pro Plan"
  date: Date,
  credits: Number       // <-- Added credits here
}, { timestamps: true });


// Add currentPlan to track the user's currently active plan
const currentPlanSchema = new mongoose.Schema({
  planId: String,
  amount: Number,
  name: String,
  date: Date,
  expiryDate: Date,
  credits: Number        // <-- Added credits here
}, { timestamps: true });


const userWalletSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  database: { type: String, required: true },
  payments: [paymentSchema],
  purchases: [purchaseSchema],
  balance: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },

  currentPlan: currentPlanSchema  // <-- Newly added
}, { timestamps: true });

// Create compound unique index for userId + database
userWalletSchema.index({ userId: 1, database: 1 }, { unique: true });

module.exports = mongoose.model("UserWallet", userWalletSchema);
