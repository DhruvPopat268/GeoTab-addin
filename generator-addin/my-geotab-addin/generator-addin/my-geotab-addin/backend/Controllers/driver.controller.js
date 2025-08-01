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
      companyName: driver.companyName,
      automatedLicenseCheck: driver.automatedLicenseCheck,
      driverNumber: driver.driverNumber,
      surname: driver.surname,
      contactNumber: driver.contactNumber,
      driverGroups: driver.driverGroups,
      depotChangeAllowed: driver.depotChangeAllowed,
      driverStatus: driver.driverStatus,
      licenseNo: driver.licenseNo,
      email: driver.email,
      depotName: driver.depotName,
      firstName: driver.firstName,
      fullName: `${driver.firstName} ${driver.surname}`,
      dob: driver.dob ? new Date(driver.dob).toLocaleDateString('en-GB') : ''
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




