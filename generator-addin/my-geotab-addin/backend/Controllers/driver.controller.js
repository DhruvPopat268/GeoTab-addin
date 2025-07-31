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
    firstName,
    userName
  } = req.body;

  try {
    if (!userName) {
      return res.status(400).json({ message: 'userName is required' });
    }

    const isDriverAlreadyExists = await driverModel.findOne({ email, userName })

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
      firstName,
      userName
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
    const { email, updatedData, userName } = req.body;

    

    if (!email || !updatedData || !userName) {
      return res.status(400).json({ message: 'Email, updatedData, and userName are required.' });
    }

    const updatedUser = await driverModel.findOneAndUpdate(
      { email: email, userName },          // Filter by email and userName
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
      const { email, userName } = req.body;

      if (!email || !userName) {
        return res.status(400).json({
          success: false,
          message: 'Email and userName are required'
        });
      }

      const driver = await driverModel.findOneAndDelete({ email, userName });

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
    const { userName } = req.body;
    
    if (!userName) {
      return res.status(400).json({ message: 'userName is required' });
    }

    // Get drivers only for the specific user
    const drivers = await driverModel.find({ userName });
    
    // Transform the data to match your frontend format
    const formattedDrivers = drivers.map(driver => ({
      id: driver._id,
      geotabId: driver.geotabId,
      phoneNumber: driver.phoneNumber,
      licenseNo: driver.licenseNo,
      email: driver.Email,
      lastName: driver.lastName,
      firstName: driver.firstName,
      fullName: `${driver.firstName} ${driver.lastName}`,
      licenseProvince: driver.licenseProvince,
      lcCheckInterval: driver.lcCheckInterval || 1,
      driverStatus: driver.driverStatus || 'Active'
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
    const userName = req.body.userName; // Get userName from request body
    
    if (!Array.isArray(incomingDrivers)) {
      return res.status(400).json({ message: 'drivers array required' });
    }

    if (!userName) {
      return res.status(400).json({ message: 'userName is required' });
    }

    // Get all current drivers from DB for this specific user
    const dbDrivers = await driverModel.find({ userName });
    const dbGeotabIds = dbDrivers.map(d => d.geotabId);
    const incomingGeotabIds = incomingDrivers.map(d => d.geotabId);

    // Upsert all incoming drivers
    const upserted = [];
    for (const driver of incomingDrivers) {
      try {
        // Add userName to each driver
        driver.userName = userName;
        
        // Find existing driver in DB by geotabId
        const existing = dbDrivers.find(d => d.geotabId === driver.geotabId);
        
        // Preserve lcCheckInterval if it exists in DB and is valid
        if (existing && typeof existing.lcCheckInterval === 'number' && existing.lcCheckInterval > 0) {
          driver.lcCheckInterval = existing.lcCheckInterval;
        } else if (!driver.lcCheckInterval || typeof driver.lcCheckInterval !== 'number' || driver.lcCheckInterval <= 0) {
          // Set default interval if none exists or invalid
          driver.lcCheckInterval = 1;
        }
        
        const result = await driverModel.upsertDriver(driver);
        upserted.push(result);
      } catch (error) {
        console.error(`Error upserting driver ${driver.geotabId}:`, error);
        if (error.code === 11000) {
          console.log(`Duplicate key error for driver ${driver.geotabId} - skipping`);
        }
      }
    }

    // Delete (or mark inactive) drivers not in incoming list for this user
    const toDelete = dbDrivers.filter(d => !incomingGeotabIds.includes(d.geotabId));
    const deleted = [];
    for (const driver of toDelete) {
      // Hard delete:
      await driverModel.deleteOne({ geotabId: driver.geotabId, userName });
      deleted.push(driver);
      // Or for soft delete, use:
      // await driverModel.updateOne({ geotabId: driver.geotabId, userName }, { $set: { isActive: false } });
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
    const { licenseNo, lcCheckInterval, userName } = req.body;
    if (!licenseNo || typeof lcCheckInterval !== 'number' || !userName) {
      return res.status(400).json({ message: 'licenseNo, lcCheckInterval (number), and userName are required.' });
    }
    const updated = await driverModel.findOneAndUpdate(
      { licenseNo, userName },
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



