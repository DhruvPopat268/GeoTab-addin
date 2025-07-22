const express = require('express')
const driverController = require('../Controllers/driver.controller')

const router = express.Router();

router.post('/create', driverController.createDriver)

router.get('/getAllDrivers',driverController.getAllDrivers)

router.patch('/update', driverController.updateDriver)

router.delete('/delete', driverController.deleteDriver)

// Add sync route
router.post('/sync', driverController.syncDrivers)

module.exports = router;