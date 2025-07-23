const mongoose = require('mongoose');

// Define the driver sub-schema (same as previous driver schema, minus userId)
const driverSchema = new mongoose.Schema({
  companyName: {
    type: String,
    enum: ['Company A', 'Company B'],
    required: true
  },
  automatedLicenseCheck: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  driverNumber: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  driverGroups: {
    type: String,
    enum: ['Group 1', 'Group 2'],
    required: true
  },
  depotChangeAllowed: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  driverStatus: {
    type: String,
    enum: ['Active', 'InActive', 'Archive'],
    required: true
  },
  licenseNo: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  depotName: {
    type: String,
    enum: ['Main Depot', 'North Depot'],
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lcCheckInterval: {
    type: Number,
    default: 1
  },
  lastCheckedAt: {
    type: Date,
    default: null
  }
}, { _id: false });

// Main schema: one document per user
const userDriversSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  drivers: [driverSchema]
}, { timestamps: true });

const driverModel = mongoose.model('UserDrivers', userDriversSchema);

module.exports = driverModel;