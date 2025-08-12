const mongoose = require('mongoose');

const driverConsentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  licenseNo: { type: String, required: true },
  signature: { type: String, required: true } // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('DriverConsent', driverConsentSchema);