const DriverData = require('../models/driverData');

module.exports.driverData = async (req, res, next) => {
  try {
    const data = req.body.data;
    const userId = req.body.userId;
    const database = req.body.database;
    const licenceNumber = data?.driver?.drivingLicenceNumber;

    if (!userId || !database || !licenceNumber) {
      return res.status(400).json({ message: "Missing userId, database, or drivingLicenceNumber" });
    }

    const existing = await DriverData.findOne({ userId, database, drivingLicenceNumber: licenceNumber });

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
      existing.details.push(detailEntry);
      await existing.save();
      return res.status(200).json({ message: 'Data appended successfully' });
    } else {
      const newDriverData = new DriverData({
        userId,
        database,
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
    const { userId, database, drivingLicenceNumber } = req.body;

    if (!userId || !database || !drivingLicenceNumber) {
      return res.status(400).json({ status: false, message: "Missing userId, database, or drivingLicenceNumber" });
    }

    const driverDoc = await DriverData.findOne({ userId, database, drivingLicenceNumber });

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
    const { userId, database, drivingLicenceNumber } = req.body;

    if (!userId || !database || !drivingLicenceNumber) {
      return res.status(400).json({ message: "Missing userId, database, or drivingLicenceNumber" });
    }

    const driverDoc = await DriverData.findOne({ userId, database, drivingLicenceNumber });

    if (!driverDoc || !driverDoc.details || driverDoc.details.length === 0) {
      return res.status(404).json({ message: "No driver details found" });
    }

    // 🔽 Sort details array by createdAt descending (-1)
    const sortedDetails = [...driverDoc.details].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      message: "Driver details found",
      data: {
        drivingLicenceNumber: driverDoc.drivingLicenceNumber,
        details: sortedDetails,
      },
    });

  } catch (error) {
    console.error("Error fetching driver details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports.getDriverDetailByLcCheckId = async (req, res) => {
  try {
    const { userId, database, licenceNo, lcCheckId } = req.body;

    if (!userId || !database || !licenceNo || !lcCheckId) {
      return res.status(400).json({ status: false, message: "Missing userId, database, licenceNo or lcCheckId" });
    }

    const driverDoc = await DriverData.findOne({ userId, database, drivingLicenceNumber: licenceNo });

    if (!driverDoc || !Array.isArray(driverDoc.details)) {
      return res.status(404).json({ status: false, message: "Driver or details not found" });
    }

    const detail = driverDoc.details.find(d => d._id.toString() === lcCheckId);

    if (!detail) {
      return res.status(404).json({ status: false, message: "LC Check ID not found in driver details" });
    }

    return res.status(200).json({
      status: true,
      data: detail
    });

  } catch (error) {
    console.error("Error fetching driver detail:", error);
    res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
};