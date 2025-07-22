const express = require('express');
const router = express.Router();
const driverConsentController = require('../Controllers/DriverConsent')

router.post('/', driverConsentController.createDriverConsent);

router.post('/sendEmail', driverConsentController.sendEmail);

module.exports = router;