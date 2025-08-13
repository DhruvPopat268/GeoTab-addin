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
  if (!data.companyDetails.accountNumber) errors.push('Account number is required');
  if (!data.companyDetails.reference) errors.push('Reference number is required');

  // Check driver details
  if (!data.driverDetails.surname) errors.push('Driver surname is required');
  if (!data.driverDetails.firstName) errors.push('Driver first name is required');
  if (!data.driverDetails.dateOfBirth) errors.push('Date of birth is required');
  if (!data.driverDetails.currentAddress.line1) errors.push('Current address line 1 is required');
  if (!data.driverDetails.currentAddress.postTown) errors.push('Current address post town is required');
  if (!data.driverDetails.currentAddress.postcode) errors.push('Current address postcode is required');
  if (!data.driverDetails.driverLicenceNumber) errors.push('Driver licence number is required');

  // Check declaration
  if (!data.declaration.signature) errors.push('Signature is required');
  if (!data.declaration.signatureDate) errors.push('Signature date is required');

  return errors;
};

// Create new driver consent form
module.exports.createDriverConsent = async (req, res, next) => {
  try {
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
      signature,
      signatureDate,
      declarationDate,

      // Additional metadata
      submittedBy
    } = req.body;

    // Collect sequential input data
    const processedData = {
      postcodes: {
        company: collectSequentialInputs('postcode1', req),
        current: collectSequentialInputs('currentPostcode', req),
        licence: collectSequentialInputs('licencePostcode', req)
      },
      dateInputs: {
        dateOfBirth: collectSequentialInputs('dob', req),
        signatureDate: collectSequentialInputs('signatureDate', req)
      },
      licenceNumber: collectSequentialInputs('licenceNumber', req)
    };

    // Structure the data according to schema
    const formData = {
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
        signatureDate: signatureDate || processedData.dateInputs.signatureDate,
        declarationDate: declarationDate ? new Date(declarationDate) : new Date()
      },
      submittedBy: submittedBy || 'anonymous',
      processedData: processedData
    };

    // Validate required fields
    const validationErrors = validateRequiredFields(formData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }

    // Check if signature is provided
    if (!signature) {
      return res.status(400).json({ error: "Signature is required" });
    }

    // Upload Base64 signature to Cloudinary
    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(signature, {
        folder: "d906-signatures",
        resource_type: "image",
        public_id: `signature_${formData.driverDetails.driverLicenceNumber}_${Date.now()}`,
        transformation: [
          { quality: "auto:good" },
          { format: "png" }
        ]
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload signature" });
    }

    // Add signature URL to form data
    formData.declaration.signature = uploadResponse.secure_url;

    // Check if driver with this licence number already exists
    const existingDriver = await DriverConsent.findByLicenceNumber(
      formData.driverDetails.driverLicenceNumber
    );

    if (existingDriver) {
      return res.status(409).json({
        error: "Driver with this licence number already exists",
        existingId: existingDriver._id
      });
    }

    // Save to MongoDB
    const newDriverConsent = await DriverConsent.create(formData);

    // Return success response with minimal data (exclude sensitive info)
    const responseData = {
      _id: newDriverConsent._id,
      fullName: newDriverConsent.fullName,
      licenceNumber: newDriverConsent.driverDetails.driverLicenceNumber,
      formStatus: newDriverConsent.formStatus,
      submissionDate: newDriverConsent.createdAt,
      company: newDriverConsent.companyDetails.companyName,
      reference: newDriverConsent.companyDetails.reference
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