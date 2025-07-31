const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({

  geotabId: {
    type: String,
    required: true,
    unique: true
  },

  userName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,// Added required if needed
  },

  phoneNumber: {
    type: String,  // Changed from Number to String for phone numbers
    required: true,
    validate: {  // Fixed validation (can't have duplicate minlength)
      validator: function(v) {
        return /^\d{10}$/.test(v);  // Exactly 10 digits
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },

  licenseNo: {  // Changed from driverLicenceCheck for consistency
    type: String,
    required: true
  },

  Email: {
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

  firstName: {  // Added computed full name
    type: String,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lcCheckInterval: {
    type: Number,
    default: 1 // in minutes
  },

  lastCheckedAt: {
    type: Date,
    default: null
  },

  licenseProvince : {
    type: String,
  }

}, { timestamps: true });

// Static upsert method for syncing
// Usage: Driver.upsertDriver(driverData)
driverSchema.statics.upsertDriver = async function(driverData) {
  // Use geotabId and userName as unique identifier for syncing
  return this.findOneAndUpdate(
    { geotabId: driverData.geotabId, userName: driverData.userName },
    { $set: driverData },
    { upsert: true, new: true }
  );
};

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver