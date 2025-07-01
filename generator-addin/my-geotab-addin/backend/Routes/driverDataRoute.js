const express = require('express');
const router = express.Router();
const DriverData = require('../models/driverData');

// CREATE or UPDATE Driver Data
router.post('/driverData', async (req, res) => {
  try {
    const data = req.body.data;
    const licenceNumber = data?.driver?.drivingLicenceNumber;

    if (!licenceNumber) {
      return res.status(400).json({ message: "Missing drivingLicenceNumber" });
    }

    const existing = await DriverData.findOne({ 'driver.drivingLicenceNumber': licenceNumber });

    if (existing) {
      await DriverData.updateOne({ 'driver.drivingLicenceNumber': licenceNumber }, data);
      return res.status(200).json({ message: 'Updated successfully' });
    } else {
      const newDriver = new DriverData(data);
      await newDriver.save();
      return res.status(201).json({ message: 'Created successfully' });
    }
  } catch (error) {
    console.error('Error storing driver data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;