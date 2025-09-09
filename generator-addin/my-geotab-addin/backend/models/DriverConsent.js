const mongoose = require('mongoose');

const driverConsentSchema = new mongoose.Schema({
  // Section 1 - Company Details
  companyDetails: {
    companyName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    reference: { type: String, required: true },
    taxiLicensing: { type: String },
    yorkRoad: { type: String },
    leeds: { type: String },
    postcode: { type: String },
    existingBehalf: { type: Boolean, default: false },
    companyNameBelow: { type: String }
  },

  // Section 2 - Processing Information
  processingInfo: {
    needCPC: { type: Boolean, default: false },
    needTachograph: { type: Boolean, default: false }
  },

  // Section 3 - Driver Details
  driverDetails: {
    surname: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    dateOfBirth: { type: String, required: true }, // Store as string (DDMMYYYY)
    currentAddress: {
      line1: { type: String, required: true },
      line2: { type: String },
      line3: { type: String },
      postTown: { type: String, required: true },
      postcode: { type: String, required: true }
    },
    licenceAddress: {
      line1: { type: String },
      line2: { type: String },
      line3: { type: String },
      postTown: { type: String },
      postcode: { type: String }
    },
    driverLicenceNumber: { type: String, required: true }
  },

  // Section 4 - Declaration
  declaration: {
    description: { type: String },
    signature: { type: String, required: true }, // Cloudinary URL
    signatureDate: { type: String, required: true }, // Store as string (DDMMYYYY)
    declarationDate: { type: Date }
  },

  // Additional metadata
  formStatus: { 
    type: String, 
    enum: ['draft', 'submitted', 'processed', 'approved', 'rejected'],
    default: 'submitted'
  },
  
  submittedBy: { type: String }, // User who submitted the form
  
  // Processed data from individual input boxes
  processedData: {
    postcodes: {
      company: { type: String },
      current: { type: String },
      licence: { type: String }
    },
    dateInputs: {
      dateOfBirth: { type: String },
      signatureDate: { type: String }
    },
    licenceNumber: { type: String }
  }

}, { 
  timestamps: true,
  // Add indexes for frequently queried fields
  indexes: [
    { 'driverDetails.driverLicenceNumber': 1 },
    { 'driverDetails.surname': 1 },
    { 'driverDetails.firstName': 1 },
    { formStatus: 1 },
    { createdAt: -1 }
  ]
});

// Virtual field to get full name
driverConsentSchema.virtual('fullName').get(function() {
  const { firstName, middleName, surname } = this.driverDetails;
  return middleName ? 
    `${firstName} ${middleName} ${surname}` : 
    `${firstName} ${surname}`;
});

// Virtual field to check if licence address is different from current
driverConsentSchema.virtual('hasAlternateLicenceAddress').get(function() {
  const { licenceAddress } = this.driverDetails;
  return !!(licenceAddress.line1 || licenceAddress.postTown);
});

// Method to format date of birth
driverConsentSchema.methods.getFormattedDateOfBirth = function() {
  const dob = this.driverDetails.dateOfBirth;
  if (dob && dob.length === 8) {
    return `${dob.slice(0,2)}/${dob.slice(2,4)}/${dob.slice(4,8)}`;
  }
  return dob;
};

// Method to format signature date
driverConsentSchema.methods.getFormattedSignatureDate = function() {
  const sigDate = this.declaration.signatureDate;
  if (sigDate && sigDate.length === 8) {
    return `${sigDate.slice(0,2)}/${sigDate.slice(2,4)}/${sigDate.slice(4,8)}`;
  }
  return sigDate;
};

// Static method to find by licence number
driverConsentSchema.statics.findByLicenceNumber = function(licenceNumber) {
  return this.findOne({ 'driverDetails.driverLicenceNumber': licenceNumber });
};

// Static method to find by company
driverConsentSchema.statics.findByCompany = function(companyName) {
  return this.find({ 'companyDetails.companyName': new RegExp(companyName, 'i') });
};

// Pre-save middleware to process sequential input data
driverConsentSchema.pre('save', function(next) {
  // Combine individual postcode inputs if they exist
  if (this.processedData && this.processedData.postcodes) {
    if (this.processedData.postcodes.company) {
      this.companyDetails.postcode = this.processedData.postcodes.company;
    }
    if (this.processedData.postcodes.current) {
      this.driverDetails.currentAddress.postcode = this.processedData.postcodes.current;
    }
    if (this.processedData.postcodes.licence) {
      this.driverDetails.licenceAddress.postcode = this.processedData.postcodes.licence;
    }
  }
  
  // Combine individual date inputs if they exist
  if (this.processedData && this.processedData.dateInputs) {
    if (this.processedData.dateInputs.dateOfBirth) {
      this.driverDetails.dateOfBirth = this.processedData.dateInputs.dateOfBirth;
    }
    if (this.processedData.dateInputs.signatureDate) {
      this.declaration.signatureDate = this.processedData.dateInputs.signatureDate;
    }
  }
  
  // Combine individual licence number inputs if they exist
  if (this.processedData && this.processedData.licenceNumber) {
    this.driverDetails.driverLicenceNumber = this.processedData.licenceNumber;
  }
  
  next();
});

module.exports = mongoose.model('DriverConsent', driverConsentSchema);