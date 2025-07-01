const express = require('express');
const router = express.Router();
const driverDataController = require('../Controllers/driverData.controller')

// CREATE or UPDATE Driver Data
router.post('/', driverDataController.driverData);

module.exports = router;