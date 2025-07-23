const driverModel = require('../models/driverModel')

// Create or add driver for a user
module.exports.createDriver = async (req, res, next) => {
  const {
    companyName,
    automatedLicenseCheck,
    driverNumber,
    surname,
    contactNumber,
    driverGroups,
    depotChangeAllowed,
    driverStatus,
    licenseNo,
    email,
    depotName,
    firstName,
    userId,
    userName
  } = req.body;
  const resolvedUserId = userId || userName;
  if (!resolvedUserId) return res.status(400).json({ message: 'userId or userName required' });
  const driverData = {
    companyName,
    automatedLicenseCheck,
    driverNumber,
    surname,
    contactNumber,
    driverGroups,
    depotChangeAllowed,
    driverStatus,
    licenseNo,
    email,
    depotName,
    firstName
  };
  try {
    let userDoc = await driverModel.findOne({ userId: resolvedUserId });
    if (userDoc) {
      // Check for duplicate driver by licenseNo or email
      const exists = userDoc.drivers.some(d => d.licenseNo === licenseNo || d.email === email);
      if (exists) return res.status(409).json({ message: 'Driver already exists for this user.' });
      userDoc.drivers.push(driverData);
      await userDoc.save();
    } else {
      await driverModel.create({ userId: resolvedUserId, drivers: [driverData] });
    }
    return res.status(200).json({ message: 'Driver created successfully' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

// Update a driver for a user
module.exports.updateDriver = async (req, res, next) => {
  try {
    const { userId, userName, licenseNo, updatedData } = req.body;
    const resolvedUserId = userId || userName;
    if (!resolvedUserId || !licenseNo || !updatedData) {
      return res.status(400).json({ message: 'userId/userName, licenseNo, and updatedData are required.' });
    }
    const userDoc = await driverModel.findOne({ userId: resolvedUserId });
    if (!userDoc) return res.status(404).json({ message: 'User not found.' });
    const idx = userDoc.drivers.findIndex(d => d.licenseNo === licenseNo);
    if (idx === -1) return res.status(404).json({ message: 'Driver not found.' });
    userDoc.drivers[idx] = { ...userDoc.drivers[idx]._doc, ...updatedData };
    await userDoc.save();
    return res.status(200).json({ message: 'Driver updated successfully.', data: userDoc.drivers[idx] });
  } catch (error) {
    console.error('Error updating driver:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete a driver for a user
module.exports.deleteDriver = async (req, res, next) => {
  try {
    const { userId, userName, licenseNo } = req.body;
    const resolvedUserId = userId || userName;
    if (!resolvedUserId || !licenseNo) {
      return res.status(400).json({ success: false, message: 'userId/userName and licenseNo are required' });
    }
    const userDoc = await driverModel.findOne({ userId: resolvedUserId });
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });
    const before = userDoc.drivers.length;
    userDoc.drivers = userDoc.drivers.filter(d => d.licenseNo !== licenseNo);
    if (userDoc.drivers.length === before) return res.status(404).json({ success: false, message: 'Driver not found' });
    await userDoc.save();
    res.status(200).json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ success: false, message: 'Error deleting driver', error: error.message });
  }
};

// Get all drivers for a user
module.exports.getAllDrivers = async (req, res, next) => {
  try {
    const { userId, userName } = req.query;
    const resolvedUserId = userId || userName;
    if (!resolvedUserId) return res.status(400).json({ message: 'userId or userName required' });
    const userDoc = await driverModel.findOne({ userId: resolvedUserId });
    if (!userDoc) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({ message: 'Drivers fetched successfully', data: userDoc.drivers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch drivers', details: error.message });
  }
};

// Sync drivers for a user (replace all)
module.exports.syncDrivers = async (req, res, next) => {
  try {
    const incomingDrivers = req.body.drivers;
    const userName = req.body.userName;
    const userId = req.body.userId;
    const resolvedUserId = userId || userName;
    console.log(incomingDrivers)
    if (!resolvedUserId) return res.status(400).json({ message: 'userId or userName required' });
    if (!Array.isArray(incomingDrivers)) {
      return res.status(400).json({ message: 'drivers array required' });
    }
    let userDoc = await driverModel.findOne({ userId: resolvedUserId });
    if (userDoc) {
      userDoc.drivers = incomingDrivers;
      await userDoc.save();
    } else {
      await driverModel.create({ userId: resolvedUserId, drivers: incomingDrivers });
    }
    res.status(200).json({ message: 'Drivers synced', upserted: incomingDrivers.length });
  } catch (error) {
    console.error('Error syncing drivers:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update only the interval for a driver
module.exports.updateDriverInterval = async (req, res, next) => {
  try {
    const { userId, userName, licenseNo, lcCheckInterval } = req.body;
    const resolvedUserId = userId || userName;
    if (!resolvedUserId || !licenseNo || typeof lcCheckInterval !== 'number') {
      return res.status(400).json({ message: 'userId/userName, licenseNo and lcCheckInterval (number) are required.' });
    }
    const userDoc = await driverModel.findOne({ userId: resolvedUserId });
    if (!userDoc) return res.status(404).json({ message: 'User not found.' });
    const idx = userDoc.drivers.findIndex(d => d.licenseNo === licenseNo);
    if (idx === -1) return res.status(404).json({ message: 'Driver not found.' });
    userDoc.drivers[idx].lcCheckInterval = lcCheckInterval;
    await userDoc.save();
    return res.status(200).json({ message: 'Interval updated', data: userDoc.drivers[idx] });
  } catch (error) {
    console.error('Error updating interval:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};




