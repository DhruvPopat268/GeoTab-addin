const express = require('express');
const router = express.Router();
const driverConsentController = require('../Controllers/DriverConsent')
const multer  = require('multer');
const upload = multer();

router.post('/', upload.single('signature'), driverConsentController.createDriverConsent);

router.post('/sendEmail', driverConsentController.sendEmail);

module.exports = router;