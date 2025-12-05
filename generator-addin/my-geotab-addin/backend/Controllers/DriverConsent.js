const DriverConsent = require('../models/DriverConsent')
const sendEmail = require('../utills/sendEmail')
const cloudinary = require('cloudinary').v2;

try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
} catch (configError) {
  console.error('Failed to configure Cloudinary:', configError);
  throw new Error('Cloudinary configuration failed');
}

// Helper function to collect sequential inputs or use combined fields
const collectInputData = (groupName, data, combinedField) => {
  if (combinedField && data[combinedField]) {
    return data[combinedField];
  }

  const inputs = [];
  let index = 0;

  while (data[`${groupName}_${index}`] !== undefined) {
    inputs.push(data[`${groupName}_${index}`]);
    index++;
  }

  return inputs.join('');
};

// Enhanced validation function
const validateFormData = (data) => {
  const errors = [];
  const requiredFields = {
    companyName: 'Company name is required',
    accountNumber: 'Account number is required',
    reference: 'Reference number is required',
    surname: 'Driver surname is required',
    firstName: 'Driver first name is required',
    'currentAddress.line1': 'Current address line 1 is required',
    'currentAddress.postTown': 'Current address post town is required',
  };

  Object.entries(requiredFields).forEach(([field, message]) => {
    const fieldParts = field.split('.');
    let value = data;

    for (const part of fieldParts) {
      value = value?.[part];
      if (value === undefined) break;
    }

    if (!value) {
      errors.push(message);
    }
  });

  if (!data.dob_combined && !data.dateOfBirth) {
    errors.push('Date of birth is required');
  }
  if (!data.currentPostcode_combined && !data.currentAddress?.postcode) {
    errors.push('Current address postcode is required');
  }
  if (!data.licenceNumber_combined && !data.driverLicenceNumber) {
    errors.push('Driver licence number is required');
  }
  if (!data.signatureDate_combined && !data.signatureDate) {
    errors.push('Signature date is required');
  }

  return errors;
};

// Structure the form data consistently
const structureFormData = (formData) => {
  const processedData = {
    postcodes: {
      company: collectInputData('postcode1', formData, 'postcode1_combined'),
      current: collectInputData('currentPostcode', formData, 'currentPostcode_combined'),
      licence: collectInputData('licencePostcode', formData, 'licencePostcode_combined')
    },
    dates: {
      dob: collectInputData('dob', formData, 'dob_combined'),
      signatureDate: collectInputData('signatureDate', formData, 'signatureDate_combined')
    },
    licenceNumber: collectInputData('licenceNumber', formData, 'licenceNumber_combined')
  };

  return {
    companyDetails: {
      companyName: formData.companyName || '',
      accountNumber: formData.accountNumber || '',
      reference: formData.reference || '',
      taxiLicensing: formData.taxiLicensing || '',
      yorkRoad: formData.yorkRoad || '',
      leeds: formData.leeds || '',
      existingBehalf: formData.existingBehalf === 'true' || formData.existingBehalf === true,
      companyNameBelow: formData.companyNameBelow || ''
    },
    processingInfo: {
      needCPC: formData.needCPC === 'true' || formData.needCPC === true,
      needTachograph: formData.needTachograph === 'true' || formData.needTachograph === true
    },
    driverDetails: {
      surname: formData.surname || '',
      firstName: formData.firstName || '',
      middleName: formData.middleName || '',
      dateOfBirth: formData.dateOfBirth || processedData.dates.dob,
      currentAddress: {
        line1: formData.currentAddress?.line1 || '',
        line2: formData.currentAddress?.line2 || '',
        line3: formData.currentAddress?.line3 || '',
        postTown: formData.currentAddress?.postTown || '',
        postcode: formData.currentAddress?.postcode || processedData.postcodes.current
      },
      licenceAddress: {
        line1: formData.licenceAddress?.line1 || '',
        line2: formData.licenceAddress?.line2 || '',
        line3: formData.licenceAddress?.line3 || '',
        postTown: formData.licenceAddress?.postTown || '',
        postcode: formData.licenceAddress?.postcode || processedData.postcodes.licence
      },
      driverLicenceNumber: formData.driverLicenceNumber || processedData.licenceNumber
    },
    declaration: {
      description: formData.description || '',
      signatureDate: formData.signatureDate || processedData.dates.signatureDate,
      declarationDate: formData.declarationDate ? new Date(formData.declarationDate) : new Date()
    },
    submittedBy: formData.submittedBy || 'web_form'
  };
};

// Handle Cloudinary upload with better error handling
const uploadSignature = async (file, licenceNumber) => {
  if (!file.buffer || file.buffer.length === 0) {
    throw new Error("File buffer is empty or undefined");
  }

  // Verify Cloudinary configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary configuration is missing");
  }

  const base64Signature = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  if (!base64Signature || base64Signature.length < 100) {
    throw new Error("Invalid base64 signature data");
  }

  const publicId = `signature_${licenceNumber || 'unknown'}_${Date.now()}`;

  return cloudinary.uploader.upload(base64Signature, {
    folder: "d906-signatures",
    resource_type: "image",
    public_id: publicId,
    transformation: [
      { quality: "auto:good" },
      { format: "png" }
    ],
    timeout: 60000,
    use_filename: false,
    unique_filename: true
  });
};

// Main controller function
module.exports.createDriverConsent = async (req, res) => {
  try {
    // Validate signature file
    if (!req.file) {
      return res.status(400).json({ error: "Signature file is required" });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: "File must be an image" });
    }

    // Parse JSON payload
    let formData;
    try {
      formData = JSON.parse(req.body.payload);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }

    // Structure the form data
    const structuredData = structureFormData(formData);

    // Upload signature to Cloudinary
    let uploadResponse;
    try {
      console.log('Cloudinary config:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING',
        api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'MISSING'
      });

      uploadResponse = await uploadSignature(
        req.file,
        structuredData.driverDetails.driverLicenceNumber
      );

      if (!uploadResponse?.secure_url) {
        throw new Error("Upload completed but no URL received");
      }
    } catch (uploadError) {
      console.error("Cloudinary upload error:", {
        message: uploadError.message,
        stack: uploadError.stack,
        http_code: uploadError.http_code,
        error: uploadError.error
      });

      let errorMessage = "Failed to upload signature";
      if (uploadError.message.includes('configuration')) {
        errorMessage = "Cloudinary configuration error";
      } else if (uploadError.message.includes('timeout')) {
        errorMessage = "Upload timeout";
      } else if (uploadError.http_code === 401) {
        errorMessage = "Cloudinary authentication failed";
      }

      return res.status(500).json({
        error: errorMessage,
        details: uploadError.message
      });
    }

    // Add signature URL to form data
    structuredData.declaration.signature = uploadResponse.secure_url;

    // Check for existing driver
    const existingDriver = await DriverConsent.findByLicenceNumber(
      structuredData.driverDetails.driverLicenceNumber
    );

    if (existingDriver) {
      return res.status(409).json({
        error: "Driver with this licence number already exists",
        existingId: existingDriver._id
      });
    }

    // Save to database
    const newDriverConsent = await DriverConsent.create(structuredData);

    // Prepare response
    const responseData = {
      _id: newDriverConsent._id,
      fullName: `${structuredData.driverDetails.firstName} ${structuredData.driverDetails.surname}`,
      licenceNumber: structuredData.driverDetails.driverLicenceNumber,
      formStatus: newDriverConsent.formStatus || 'submitted',
      submissionDate: newDriverConsent.createdAt,
      company: structuredData.companyDetails.companyName,
      reference: structuredData.companyDetails.reference,
      signatureUrl: structuredData.declaration.signature
    };

    res.status(201).json({
      message: "D906 form submitted successfully",
      data: responseData
    });

  } catch (err) {
    console.error("Error in createDriverConsent:", err);

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

    res.status(500).json({
      error: "Server error while processing form",
      details: err.message
    });
  }
};

module.exports.sendEmail = async (req, res, next) => {
  const { firstName, lastName, licenceNo, email } = req.body;
  const toEmail = email;

  try {
    // Validate email before doing anything else
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!toEmail || !emailRegex.test(toEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address"
      });
    }

    console.log(licenceNo);
    
    const driver = await DriverConsent.findOne({
      "driverDetails.driverLicenceNumber": licenceNo
    });

    console.log(driver);

    // CASE 1: Driver not found → send consent form email
    if (!driver) {
      try {
        await sendEmail(toEmail, licenceNo); // may throw error
      } catch (err) {
        console.error("Email sending failed:", err.message);
        return res.status(400).json({
          success: false,
          message: err.message  // e.g. "Invalid email address"
        });
      }

      return res.status(400).json({
        success: false,
        message: "License number not found. Consent form sent to driver email."
      });
    }

    // CASE 2: Driver exists → check name match
    const firstMatch =
      driver.driverDetails.firstName.toLowerCase() === firstName.toLowerCase();
    const lastMatch =
      driver.driverDetails.surname.toLowerCase() === lastName.toLowerCase();

    if (firstMatch && lastMatch) {
      return res.json({
        success: true,
        message: "License and name matched"
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "License number exists, but names do not match."
      });
    }

  } catch (error) {
    console.error("Server Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};