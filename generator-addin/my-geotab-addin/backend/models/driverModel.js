const mongoose = require('mongoose');

// Define the driver sub-schema
const driverSchema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: true
  },
<<<<<<< HEAD
  surname: {
    type: String,// Added required if needed
  },
  contactNumber: {
    type: String,  // Changed from Number to String for phone numbers
    required: true,
    validate: {  // Fixed validation (can't have duplicate minlength)
      validator: function(v) {
        return /^\d{10}$/.test(v);  // Exactly 10 digits
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  driverGroups: {  // Fixed typo in field name (was driverGoups)
    type: String,  // Added missing type
    enum: ['Group 1', 'Group 2'],  // Added actual groups
    required: true
  },
  depotChangeAllowed: {
    type: String,  // Added missing type
    enum: ['Yes', 'No'],
    // required: true
  },
  driverStatus: {
    type: String,  // Added missing type
    enum: ['Active', 'InActive', 'Archive'],  // Fixed capitalization
    // required: true
  },
  licenseNo: {  // Changed from driverLicenceCheck for consistency
=======
  lastName: {
>>>>>>> df30f5e6b69036ddf0b3d503bac3bb0483349ab7
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
<<<<<<< HEAD
  depotName: {
    type: String,  // Added missing type
    enum: ['Main Depot', 'North Depot'],  // Added actual depots
    // required: true
=======
  phoneNumber: {
    type: String,
    default: null // Optional if contactNumber is used
  },
  driverStatus: {
    type: String,
    enum: ['Active', 'InActive', 'Archive'],
    required: true
>>>>>>> df30f5e6b69036ddf0b3d503bac3bb0483349ab7
  },
  licenseNumber: {
    type: String,
    default: null // Optional duplicate field
  },
  licenseProvince: {
    type: String,
    default: null
  },
  employeeNo: {
    type: String,
    default: null
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