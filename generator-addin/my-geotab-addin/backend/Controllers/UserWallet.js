const UserWallet = require('../models/UserWallet');
const generatePaymentId = require('../utils/generateId');

module.exports.deposit = async (req, res) => {
  try {
    const { userId, database, paypalId, amount } = req.body;

    const paymentId = generatePaymentId(); // generate server-side

    // Step 1: Check if wallet exists
    const existingWallet = await UserWallet.findOne({ userId, database });

    if (existingWallet) {
      // Step 2: Wallet exists – update balance and push payment
      const updatedWallet = await UserWallet.findOneAndUpdate(
        { userId, database },
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
        database,
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
    const { userId, database, planId, planDetails } = req.body;
    
    // Validate that planDetails are provided
    if (!planDetails || !planDetails.price || !planDetails.includedCalls || !planDetails.name) {
      return res.status(400).json({ message: "Plan details are required" });
    }
    
    const amount = planDetails.price;
    const credits = planDetails.includedCalls;
    const name = planDetails.name;
    
    const wallet = await UserWallet.findOne({ userId, database });
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
      name,
      date: now,
      credits
    });
    
    // Update currentPlan
    wallet.currentPlan = {
      name,
      planId,
      amount,
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
    const { userId, database } = req.body;

    const wallet = await UserWallet.findOne({ userId, database });

    if (!wallet) {
      return res.status(200).json([]);
    }

    res.status(200).json({
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

module.exports.checksEligibility = async (req, res) => {
  try {
    const { userId, database } = req.body;

    if (!userId || !database) {
      return res.status(400).json({
        success: false,
        message: 'userId and database are required'
      });
    }

    const wallet = await UserWallet.findOne({ userId, database });

    if (!wallet) {
      return res.status(200).json({
        success: false,
        message: 'User wallet not found'
      });
    }

    const plan = wallet.currentPlan;
    const isPlanExpired = plan ? new Date(plan.expiryDate) < new Date() : true;

    // If plan expired and credits > 0, set credits to 0 and save
    if (isPlanExpired && wallet.credits > 0) {
      wallet.credits = 0;
      await wallet.save();
    }

    const currentCredits = wallet.credits || 0;
    const isZeroCredit = currentCredits === 0;

    const response = {
      success: true,
      credits: currentCredits,
      expiryDate: plan?.expiryDate || null,
      zeroCredit: isZeroCredit,
      planExpired: isPlanExpired,
      message: ''
    };

    if (!plan) {
      response.message = 'No active plan found';
    } else if (isPlanExpired) {
      response.message = 'Plan is expired';
    } else if (isZeroCredit) {
      response.message = 'No credits left';
    } else {
      response.message = 'User is eligible to use API';
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in checksEligibility:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


module.exports.deductCredit = async(req,res) => {
  const { userId, database } = req.body;

  try {
    // 👉 Your main API logic here (e.g., fetching weather, sending SMS, etc.)
    
    // Only if API logic succeeded, now deduct 1 credit:
    const wallet = await UserWallet.findOne({ userId, database });

    wallet.credits -= 1;
    await wallet.save();

    return res.status(200).json({ message: 'API call successful. 1 credit deducted.', remainingCredits: wallet.credits });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ message: 'API failed. No credits deducted.' });
  }
}