const express = require('express')
const driverController = require('../Controllers/driver.controller')

const router = express.Router();

router.post('/create', driverController.createDriver)

module.exports = router;