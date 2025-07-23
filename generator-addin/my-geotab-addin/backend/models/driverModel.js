const mongoose = require('mongoose');

// Define the driver sub-schema
const driverSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  email: {
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
  contactNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\+?\d{10,15}$/.test(v); // Adjusted to allow country codes
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  phoneNumber: {
    type: String,
    default: null // Optional if contactNumber is used
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
  id: {
    type: String,
    default: null // External or source ID
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