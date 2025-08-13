const DriverConsent = require('../models/DriverConsent')
const sendEmail = require('../utills/sendEmail')

const collectSequentialInputs = (groupName, req) => {
  const inputs = [];
  let index = 0;

  while (req.body[`${groupName}_${index}`] !== undefined) {
    inputs.push(req.body[`${groupName}_${index}`]);
    index++;
  }

  return inputs.join('');
};

// Helper function to validate required fields
const validateRequiredFields = (data) => {
  const errors = [];

  // Check company details
  if (!data.companyDetails.companyName) errors.push('Company name is required');
  if (!data.accountNumber) errors.push('Account number is required');
  if (!data.reference) errors.push('Reference number is required');

  // Check driver details
  if (!data.surname) errors.push('Driver surname is required');
  if (!data.firstName) errors.push('Driver first name is required');
  if (!data.dateOfBirth) errors.push('Date of birth is required');
  if (!data.currentAddress?.line1) errors.push('Current address line 1 is required');
  if (!data.currentAddress?.postTown) errors.push('Current address post town is required');
  if (!data.currentAddress?.postcode) errors.push('Current address postcode is required');
  if (!data.driverLicenceNumber) errors.push('Driver licence number is required');

  // Check declaration
  if (!data.signature) errors.push('Signature is required');
  if (!data.signatureDate) errors.push('Signature date is required');

  return errors;
};

// Create new driver consent form
module.exports.createDriverConsent = async (req, res, next) => {
  try {
    // Check if signature file exists
    if (!req.files || !req.files.signature) {
      return res.status(400).json({ error: "Signature PNG file is required" });
    }

    // Parse the JSON payload
    let formData;
    try {
      formData = JSON.parse(req.body.payload);
    } catch (parseError) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    const {
      // Section 1 - Company Details
      companyName,
      accountNumber,
      reference,
      taxiLicensing,
      yorkRoad,
      leeds,
      existingBehalf,
      companyNameBelow,

      // Section 2 - Processing Information
      needCPC,
      needTachograph,

      // Section 3 - Driver Details
      surname,
      firstName,
      middleName,
      dateOfBirth,
      currentAddress,
      licenceAddress,
      driverLicenceNumber,

      // Section 4 - Declaration
      description,
      signatureDate,
      declarationDate,

      // Additional metadata
      submittedBy
    } = formData;

    // Collect sequential input data
    const processedData = {
      postcodes: {
        company: collectSequentialInputs('postcode1', formData),
        current: collectSequentialInputs('currentPostcode', formData),
        licence: collectSequentialInputs('licencePostcode', formData)
      },
      dateInputs: {
        dateOfBirth: collectSequentialInputs('dob', formData),
        signatureDate: collectSequentialInputs('signatureDate', formData)
      },
      licenceNumber: collectSequentialInputs('licenceNumber', formData)
    };

    // Structure the data according to schema
    const structuredData = {
      companyDetails: {
        companyName: companyName || '',
        accountNumber: accountNumber || '',
        reference: reference || '',
        taxiLicensing: taxiLicensing || '',
        yorkRoad: yorkRoad || '',
        leeds: leeds || '',
        existingBehalf: existingBehalf === 'true' || existingBehalf === true,
        companyNameBelow: companyNameBelow || ''
      },
      processingInfo: {
        needCPC: needCPC === 'true' || needCPC === true,
        needTachograph: needTachograph === 'true' || needTachograph === true
      },
      driverDetails: {
        surname: surname || '',
        firstName: firstName || '',
        middleName: middleName || '',
        dateOfBirth: dateOfBirth || processedData.dateInputs.dateOfBirth,
        currentAddress: {
          line1: currentAddress?.line1 || '',
          line2: currentAddress?.line2 || '',
          line3: currentAddress?.line3 || '',
          postTown: currentAddress?.postTown || '',
          postcode: currentAddress?.postcode || processedData.postcodes.current
        },
        licenceAddress: {
          line1: licenceAddress?.line1 || '',
          line2: licenceAddress?.line2 || '',
          line3: licenceAddress?.line3 || '',
          postTown: licenceAddress?.postTown || '',
          postcode: licenceAddress?.postcode || processedData.postcodes.licence
        },
        driverLicenceNumber: driverLicenceNumber || processedData.licenceNumber
      },
      declaration: {
        description: description || '',
        signature: '', // Will be updated with Cloudinary URL
        signatureDate: signatureDate || processedData.dateInputs.signatureDate,
        declarationDate: declarationDate ? new Date(declarationDate) : new Date()
      },
      submittedBy: submittedBy || 'anonymous',
      processedData: processedData
    };

    // Validate required fields
    const validationErrors = validateRequiredFields(structuredData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }

    // Upload PNG signature file to Cloudinary
    let uploadResponse;
    try {
      const signatureFile = req.files.signature;
      
      // Convert file buffer to base64 for Cloudinary
      const base64Signature = `data:${signatureFile.mimetype};base64,${signatureFile.data.toString('base64')}`;
      
      uploadResponse = await cloudinary.uploader.upload(base64Signature, {
        folder: "d906-signatures",
        resource_type: "image",
        public_id: `signature_${structuredData.driverDetails.driverLicenceNumber}_${Date.now()}`,
        transformation: [
          { quality: "auto:good" },
          { format: "png" }
        ]
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload signature to Cloudinary" });
    }

    // Add signature URL to form data
    structuredData.declaration.signature = uploadResponse.secure_url;

    // Check if driver with this licence number already exists
    const existingDriver = await DriverConsent.findByLicenceNumber(
      structuredData.driverDetails.driverLicenceNumber
    );

    if (existingDriver) {
      return res.status(409).json({
        error: "Driver with this licence number already exists",
        existingId: existingDriver._id
      });
    }

    // Save to MongoDB
    const newDriverConsent = await DriverConsent.create(structuredData);

    // Return success response with minimal data (exclude sensitive info)
    const responseData = {
      _id: newDriverConsent._id,
      fullName: newDriverConsent.fullName,
      licenceNumber: newDriverConsent.driverDetails.driverLicenceNumber,
      formStatus: newDriverConsent.formStatus,
      submissionDate: newDriverConsent.createdAt,
      company: newDriverConsent.companyDetails.companyName,
      reference: newDriverConsent.companyDetails.reference,
      signatureUrl: newDriverConsent.declaration.signature
    };

    res.status(201).json({
      message: "D906 form submitted successfully",
      data: responseData
    });

  } catch (err) {
    console.error("Error creating driver consent:", err);

    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        error: "Validation error",
        details: errors
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        error: "Duplicate entry - this driver may already be registered"
      });
    }

    res.status(500).json({ error: "Server error while processing form" });
  }
};

module.exports.sendEmail = async (req, res, next) => {
  const { firstName, lastName, licenceNo, email } = req.body;
  const toEmail = email;

  try {
    console.log(licenceNo)
    const driver = await DriverConsent.findOne({ licenseNo: licenceNo });
    console.log(driver)

    if (!driver) {
      // send form email
      await sendEmail(toEmail, licenceNo);
      return res.status(400).json({
        success: false,
        message: 'License number not found. Consent form sent to driver email.',
      });
    }

    if (
      driver.firstName.toLowerCase() === firstName.toLowerCase() &&
      driver.lastName.toLowerCase() === lastName.toLowerCase()
    ) {
      return res.json({ success: true, message: 'License and name matched' });
    } else {
      return res.status(400).json({
        success: false,
        message: 'License number exists, but names do not match.',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}