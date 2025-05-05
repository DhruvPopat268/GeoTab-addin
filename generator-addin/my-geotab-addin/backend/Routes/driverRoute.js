const express = require('express')
const driverController = require('../Controllers/driver.controller')

const router = express.Router();

router.post('/create', driverController.createDriver)

router.patch('/update', driverController.updateDriver)

router.delete('/delete', driverController.deleteDriver)

module.exports = router;