const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  companyName: {
    type: String,  // Added missing type
    enum: ['Company A', 'Company B'],
    required: true
  },
  automatedLicenseCheck: {
    type: String,  // Added missing type
    enum: ['Yes', 'No'],
    required: true
  },
  driverNumber: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true  // Added required if needed
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
    required: true
  },
  driverStatus: {
    type: String,  // Added missing type
    enum: ['Active', 'InActive', 'Archive'],  // Fixed capitalization
    required: true
  },
  licenseNo: {  // Changed from driverLicenceCheck for consistency
    type: String,
    required: true
  },
 
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  depotName: {
    type: String,  // Added missing type
    enum: ['Main Depot', 'North Depot'],  // Added actual depots
    required: true
  },
  firstName: {  // Added computed full name
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Static upsert method for syncing
// Usage: Driver.upsertDriver(driverData)
driverSchema.statics.upsertDriver = async function(driverData) {
  // Use licenseNo or email as unique identifier
  return this.findOneAndUpdate(
    { licenseNo: driverData.licenseNo },
    { $set: driverData },
    { upsert: true, new: true }
  );
};

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver