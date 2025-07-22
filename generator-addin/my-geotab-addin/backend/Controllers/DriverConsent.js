const DriverConsent = require('../models/DriverConsent')
const sendEmail = require('../utills/sendEmail')

module.exports.createDriverConsent = async (req, res, next) => {
  try {
    const { firstName, lastName, country, licenseNo } = req.body;

    if (!firstName || !lastName || !country || !licenseNo) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, country, and license number are required.'
      });
    }

    const newConsent = new DriverConsent({
      firstName,
      lastName,
      country,
      licenseNo
    });

    const saved = await newConsent.save();
    res.status(201).json({ success: true, data: saved });

  } catch (err) {
    console.error('Error saving driver consent:', err);
    res.status(500).json({ success: false, message: 'Server error' });
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