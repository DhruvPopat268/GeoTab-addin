const UserWallet = require('../models/UserWallet');
const generatePaymentId = require('../utils/generateId');

module.exports.deposit = async (req, res) => {
  try {
    const { userId, paypalId, amount } = req.body;

    const paymentId = generatePaymentId(); // generate server-side

    const update = {
      $push: {
        payments: {
          paymentId,
          paypalId,
          amount,
          date: new Date()
        }
      },
      $inc: { balance: amount },
      $setOnInsert: {
        userId,
        purchases: [],
        credits: 0,
        balance: 0,
        payments: []
      }
    };

    const options = { upsert: true, new: true };

    const wallet = await UserWallet.findOneAndUpdate(
      { userId },
      update,
      options
    );

    res.status(200).json({ message: "Deposit successful", wallet });
  } catch (err) {
    console.log("Deposit error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.purchase = async (req, res) => {
  try {
    // POST /api/wallet/purchase
    router.post("/purchase", async (req, res) => {
      const { userId, planId } = req.body;

      const wallet = await UserWallet.findOne({ userId });

      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      wallet.purchases.push({
        planId,
        amount,
        description,
        date: new Date()
      });

      wallet.balance -= amount;
      wallet.credits += credits;

      await wallet.save();

      res.status(200).json({ message: "Purchase successful", wallet });
    });

  } catch (err) {
    console.log(err)
  }
}

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
      purchases: wallet.purchases
    });
  } catch (err) {
    console.log(err)
  }
}
