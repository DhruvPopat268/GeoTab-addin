const DriverData = require('../models/driverData');

module.exports.driverData = async (req, res, next) => {
  try {
    const data = req.body.data;
    const licenceNumber = data?.driver?.drivingLicenceNumber;

    if (!licenceNumber) {
      return res.status(400).json({ message: "Missing drivingLicenceNumber" });
    }

    const existing = await DriverData.findOne({ drivingLicenceNumber: licenceNumber });

    const detailEntry = {
      driver: {
        firstNames: data.driver.firstNames,
        lastName: data.driver.lastName,
        gender: data.driver.gender,
        dateOfBirth: data.driver.dateOfBirth,
        address: data.driver.address,
      },
      licence: data.licence,
      endorsements: data.endorsements,
      entitlement: data.entitlement,
      token: data.token,
      holder: data.holder,
      cpc: data.cpc,
    };

    if (existing) {
      // Append new detail
      existing.details.push(detailEntry);
      await existing.save();
      return res.status(200).json({ message: 'Data appended successfully' });
    } else {
      // Create new document
      const newDriverData = new DriverData({
        drivingLicenceNumber: licenceNumber,
        details: [detailEntry],
      });
      await newDriverData.save();
      return res.status(201).json({ message: 'Created new driver record successfully' });
    }

  } catch (error) {
    console.error('Error storing driver data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports.getRecentDriverByLicence = async (req, res) => {
  try {
    const { drivingLicenceNumber } = req.body;

    if (!drivingLicenceNumber) {
      return res.status(400).json({ status: false, message: "Missing drivingLicenceNumber" });
    }

    const driverDoc = await DriverData.findOne({ drivingLicenceNumber });

    if (!driverDoc || !driverDoc.details || driverDoc.details.length === 0) {
      return res.status(404).json({ status: false, message: "No driver details found" });
    }

    const lastDetail = driverDoc.details[driverDoc.details.length - 1];

    return res.status(200).json({
      status: true,
      data: lastDetail
    });

  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};


module.exports.getAllDriversByLicence = async (req, res) => {
  try {
    const { drivingLicenceNumber } = req.body;

    if (!drivingLicenceNumber) {
      return res.status(400).json({ message: "Missing drivingLicenceNumber" });
    }

    // Find the single document by drivingLicenceNumber
    const driverDoc = await DriverData.findOne({ drivingLicenceNumber });

    if (!driverDoc || !driverDoc.details || driverDoc.details.length === 0) {
      return res.status(404).json({ message: "No driver details found" });
    }

    res.status(200).json({
      message: "Driver details found",
      data: {
        drivingLicenceNumber: driverDoc.drivingLicenceNumber,
        details: driverDoc.details,
      },
    });

  } catch (error) {
    console.error("Error fetching driver details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};