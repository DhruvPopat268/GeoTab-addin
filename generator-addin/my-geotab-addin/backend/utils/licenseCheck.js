// generator-addin/my-geotab-addin/backend/utils/licenseCheck.js
const axios = require('axios');
// const DriverData = require('../models/driverData');

// Fetches the auth token from the external API
async function getAuthToken() {
  const authResponse = await axios.get('https://api-monitoring-and-purchasing-platform-df9e.onrender.com/proxy/6864c4fbe3b94cbfacee2b3c');
  return authResponse.data.token;
}

// Save driver data to database
async function saveDriverDataToDatabase(driverData, userId) {
  try {
    const response = await axios.post(`${process.env.BASE_URL}/api/driverData`, {
      data: driverData,
      userId: userId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Driver data saved to database for user ${userId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error saving driver data to database for user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
}

// Calls the license check API for a given driver and token
async function checkDriverLicense({ licenseNo, userId }, token) {
  try {
    const response = await axios.post(
      'https://api-monitoring-and-purchasing-platform-df9e.onrender.com/proxy/6864c95bcf7c6ae928c398c9',
      {
        drivingLicenceNumber: licenseNo,
        userId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'vHjOOKz70O3L8mmcVAQDc3EqqxfRRWOgamUSCnN1',
          'Authorization': token
        }
      }
    );
    
    console.log(`Checked license for ${licenseNo}: Status - ${response.data.status}`);
    
    // If the license check was successful and we have data, save it to database
    if (response.data && response.data.status && response.data.data) {
      try {
        await saveDriverDataToDatabase(response.data?.data, userId);
        console.log(`Successfully saved driver data for license ${licenseNo} to database`);
      } catch (dbError) {
        console.error(`Failed to save driver data to database for license ${licenseNo}:`, dbError.message);
        // Note: We don't throw here so the original response is still returned
        // even if database save fails
      }
    } else {
      console.log(`No valid data to save for license ${licenseNo}`);
    }
    
    return response.data;
  } catch (err) {
    console.error(`Error checking license for ${licenseNo}:`, err.response?.data || err.message);
    return null;
  }
}

module.exports = { getAuthToken, checkDriverLicense }; 