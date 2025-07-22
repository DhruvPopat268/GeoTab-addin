const mongoose = require('mongoose');

const driverConsentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String, required: true },
  licenseNo: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('DriverConsent', driverConsentSchema);
