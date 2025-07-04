const mongoose = require('mongoose');

const restrictionSchema = new mongoose.Schema({
  restrictionCode: String,
  restrictionLiteral: String,
}, { _id: false });

const entitlementSchema = new mongoose.Schema({
  categoryCode: String,
  categoryLegalLiteral: String,
  categoryType: String,
  fromDate: String,
  expiryDate: String,
  restrictions: [restrictionSchema],
}, { _id: false });

const unstructuredAddressSchema = new mongoose.Schema({
  line1: String,
  line5: String,
  postcode: String,
}, { _id: false });

const addressSchema = new mongoose.Schema({
  unstructuredAddress: unstructuredAddressSchema,
}, { _id: false });

const driverSchema = new mongoose.Schema({
  firstNames: String,
  lastName: String,
  gender: String,
  dateOfBirth: String,
  address: addressSchema,
}, { _id: false });

const licenceSchema = new mongoose.Schema({
  type: String,
  status: String,
}, { _id: false });

const tokenSchema = new mongoose.Schema({
  issueNumber: String,
  validFromDate: String,
  validToDate: String,
}, { _id: false });

const tachoCardSchema = new mongoose.Schema({
  cardNumber: String,
  cardStatus: String,
  cardExpiryDate: String,
  cardStartOfValidityDate: String,
}, { _id: false });

const holderSchema = new mongoose.Schema({
  tachoCards: [tachoCardSchema],
}, { _id: false });

const cpcSchema = new mongoose.Schema({
  lgvValidTo: String,
}, { _id: false });

const detailSchema = new mongoose.Schema({
  driver: driverSchema,
  licence: licenceSchema,
  endorsements: [mongoose.Schema.Types.Mixed],
  entitlement: [entitlementSchema],
  token: tokenSchema,
  holder: holderSchema,
  cpc: {
    cpcs: [cpcSchema],
  }
}, {timestamps: true });

const DriverDataSchema = new mongoose.Schema({
  drivingLicenceNumber: { type: String, required: true, unique: true },
  details: [detailSchema]
}, { timestamps: true });

module.exports = mongoose.model('DriverData', DriverDataSchema);