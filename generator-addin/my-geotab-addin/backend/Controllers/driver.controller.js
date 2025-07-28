const driverModel = require('../models/driverModel')

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
    firstName
  } = req.body;

  try {
    const isDriverAlreadyExists = await driverModel.findOne({ email })

    await driverModel.create({
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
    });


    return res.status(200).json({ message: "driver created successfully" })
  }
  catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }

}

module.exports.updateDriver = async (req, res, next) => {
  try {
    const { email, updatedData } = req.body;

    

    if (!email || !updatedData) {
      return res.status(400).json({ message: 'Email and updatedData are required.' });
    }

    const updatedUser = await driverModel.findOneAndUpdate(
      { email: email },          // Filter by email
      { $set: updatedData },     // Update fields
      { new: true }              // Return the updated document
    );


    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'User updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports.deleteDriver = async (req, res, next) => {
  
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const driver = await driverModel.findOneAndDelete({ email });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Driver deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting driver:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting driver',
        error: error.message
      });
    }
}

// Controller to get all drivers
module.exports.getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await driverModel.find({});
    
    // Transform the data to match your frontend format
    const formattedDrivers = drivers.map(driver => ({
      id: driver._id,
      driverNumber: driver.driverNumber,
      contactNumber: driver.contactNumber,
      driverStatus: driver.driverStatus,
      licenseNo: driver.licenseNo,
      email: driver.email,
      depotName: driver.depotName,
      firstName: driver.firstName,
      fullName: `${driver.firstName} ${driver.surname}`,
    }));

    return res.status(200).json({ 
      message: "Drivers fetched successfully", 
      data: formattedDrivers 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      error: "Failed to fetch drivers",
      details: error.message 
    });
  }
};

// Controller to sync drivers from Geotab
module.exports.syncDrivers = async (req, res, next) => {
  try {
    const incomingDrivers = req.body.drivers; // Array of driver objects from Geotab
    if (!Array.isArray(incomingDrivers)) {
      return res.status(400).json({ message: 'drivers array required' });
    }

    // Get all current drivers from DB
    const dbDrivers = await driverModel.find({});
    const dbLicenseNos = dbDrivers.map(d => d.licenseNo);
    const incomingLicenseNos = incomingDrivers.map(d => d.licenseNo);

    // Upsert all incoming drivers
    const upserted = [];
    for (const driver of incomingDrivers) {
      const result = await driverModel.upsertDriver(driver);
      upserted.push(result);
    }

    // Delete (or mark inactive) drivers not in incoming list
    const toDelete = dbDrivers.filter(d => !incomingLicenseNos.includes(d.licenseNo));
    const deleted = [];
    for (const driver of toDelete) {
      // Hard delete:
      await driverModel.deleteOne({ licenseNo: driver.licenseNo });
      deleted.push(driver);
      // Or for soft delete, use:
      // await driverModel.updateOne({ licenseNo: driver.licenseNo }, { $set: { isActive: false } });
    }

    res.status(200).json({
      message: 'Drivers synced',
      upserted: upserted.length,
      deleted: deleted.length
    });
  } catch (error) {
    console.error('Error syncing drivers:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update only the interval for a driver
module.exports.updateDriverInterval = async (req, res, next) => {
  try {
    const { licenseNo, lcCheckInterval } = req.body;
    if (!licenseNo || typeof lcCheckInterval !== 'number') {
      return res.status(400).json({ message: 'licenseNo and lcCheckInterval (number) are required.' });
    }
    const updated = await driverModel.findOneAndUpdate(
      { licenseNo },
      { $set: { lcCheckInterval } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Driver not found.' });
    }
    return res.status(200).json({ message: 'Interval updated', data: updated });
  } catch (error) {
    console.error('Error updating interval:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};



