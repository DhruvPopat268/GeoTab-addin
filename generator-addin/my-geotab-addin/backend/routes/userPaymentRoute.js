const express = require('express');
const router = express.Router();
const  recordPayment  = require('../Controllers/UserPayment.controller');

router.post('/record', recordPayment.recordPayment);

module.exports = router;