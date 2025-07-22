// models/DriverConsent.js
const mongoose = require('mongoose');

const DriverConsentSchema = new mongoose.Schema({
  driverName: { type: String, required: true },
  licenseNo: { type: String, required: true },
  country: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DriverConsent', DriverConsentSchema);
