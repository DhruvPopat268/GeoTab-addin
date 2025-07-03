const UserWallet = require('../models/UserWallet');
const generatePaymentId = require('../utils/generateId');

module.exports.deposit = async (req, res) => {
  try {
    const { userId, paypalId, amount } = req.body;

    const paymentId = generatePaymentId(); // generate server-side

    // Step 1: Check if wallet exists
    const existingWallet = await UserWallet.findOne({ userId });

    if (existingWallet) {
      // Step 2: Wallet exists – update balance and push payment
      const updatedWallet = await UserWallet.findOneAndUpdate(
        { userId },
        {
          $inc: { balance: amount },
          $push: {
            payments: {
              paymentId,
              paypalId,
              amount,
              date: new Date()
            }
          }
        },
        { new: true }
      );

      return res.status(200).json({ message: "Deposit successful", wallet: updatedWallet });
    } else {
      // Step 3: First-time deposit – create new wallet
      const newWallet = new UserWallet({
        userId,
        balance: amount,
        credits: 0,
        purchases: [],
        payments: [{
          paymentId,
          paypalId,
          amount,
          date: new Date()
        }]
      });

      await newWallet.save();

      return res.status(200).json({ message: "Wallet created and deposit successful", wallet: newWallet });
    }

  } catch (err) {
    console.log("Deposit error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.purchase = async (req, res) => {
  try {
    const { userId, planId, planDetails } = req.body;
    
    // Validate that planDetails are provided
    if (!planDetails || !planDetails.price || !planDetails.includedCalls || !planDetails.name) {
      return res.status(400).json({ message: "Plan details are required" });
    }
    
    const amount = planDetails.price;
    const credits = planDetails.includedCalls;
    const description = planDetails.name;
    
    const wallet = await UserWallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + 30); // 30-day validity
    
    // Add to purchase history
    wallet.purchases.push({
      planId,
      amount,
      description,
      date: now,
      credits
    });
    
    // Update currentPlan
    wallet.currentPlan = {
      planId,
      amount,
      description,
      date: now,
      expiryDate,
      credits
    };
    
    // Update balance and credits
    wallet.balance -= amount;
    wallet.credits += credits;
    
    await wallet.save();
    
    res.status(200).json({ message: "Purchase successful", wallet });
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.wallet = async (req, res) => {
  try {
    const { userId } = req.body;

    const wallet = await UserWallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json({
      userId: wallet.userId,
      balance: wallet.balance,
      credits: wallet.credits,
      payments: wallet.payments,
      purchases: wallet.purchases,
      currentPlan: wallet.currentPlan  // <-- Added currentPlan here
    });
  } catch (err) {
    console.log("Wallet fetch error:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
