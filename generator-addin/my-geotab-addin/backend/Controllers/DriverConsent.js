const DriverConsent = require('../models/DriverConsent')
const sendEmail = require('../utills/sendEmail')

module.exports.createDriverConsent = async (req, res, next) => {
  try {
    const { firstName, lastName, licenseNo, signature } = req.body;

    if (!firstName || !lastName || !licenseNo || !signature) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Upload Base64 signature to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(signature, {
      folder: "signatures",
      resource_type: "image"
    });

    // Save to MongoDB
    const newDriver = await Driver.create({
      firstName,
      lastName,
      licenseNo,
      signature: uploadResponse.secure_url
    });

    res.status(201).json(newDriver);
  } catch (err) {
    console.error("Error creating driver:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.sendEmail = async (req, res, next) => {
  const { firstName, lastName, licenceNo, email } = req.body;
  const toEmail = email;

  try {
    console.log(licenceNo)
    const driver = await DriverConsent.findOne({ licenseNo: licenceNo });
    console.log(driver)

    if (!driver) {
      // send form email
      await sendEmail(toEmail, licenceNo);
      return res.status(400).json({
        success: false,
        message: 'License number not found. Consent form sent to driver email.',
      });
    }

    if (
      driver.firstName.toLowerCase() === firstName.toLowerCase() &&
      driver.lastName.toLowerCase() === lastName.toLowerCase()
    ) {
      return res.json({ success: true, message: 'License and name matched' });
    } else {
      return res.status(400).json({
        success: false,
        message: 'License number exists, but names do not match.',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}