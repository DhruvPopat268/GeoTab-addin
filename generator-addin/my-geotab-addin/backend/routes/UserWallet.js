const express = require('express');
const router = express.Router();
const  UserWallet  = require('../Controllers/UserWallet');

router.post('/deposit', UserWallet.deposit);

router.post('/purchase', UserWallet.purchase);

router.post('/wallet', UserWallet.wallet);

module.exports = router;