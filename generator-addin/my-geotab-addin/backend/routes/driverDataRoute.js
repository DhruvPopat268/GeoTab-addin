const express = require('express');
const router = express.Router();
const driverDataController = require('../Controllers/driverData.controller')

// CREATE or UPDATE Driver Data
router.post('/', driverDataController.driverData);

router.post('/getRecentDriverByLicence', driverDataController.getRecentDriverByLicence);

router.post('/getAllDriversByLicence', driverDataController.getAllDriversByLicence);

module.exports = router;