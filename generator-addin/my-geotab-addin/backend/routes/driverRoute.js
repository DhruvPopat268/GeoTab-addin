const express = require('express')
const driverController = require('../Controllers/driver.controller')

const router = express.Router();

router.post('/create', driverController.createDriver)

router.post('/getAllDrivers',driverController.getAllDrivers)

router.patch('/update', driverController.updateDriver)

router.delete('/delete', driverController.deleteDriver)

// Add sync route
router.post('/sync', driverController.syncDrivers)

// Add update interval route
router.patch('/update-interval', driverController.updateDriverInterval)

module.exports = router;