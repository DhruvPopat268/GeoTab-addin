// generator-addin/my-geotab-addin/backend/utils/licenseCheck.js
const axios = require('axios');

// Fetches the auth token from the external API
async function getAuthToken() {
  const authResponse = await axios.get('https://api-monitoring-and-purchasing-platform-df9e.onrender.com/proxy/6864c4fbe3b94cbfacee2b3c');
  return authResponse.data.token;
}

// Calls the license check API for a given driver and token
async function checkDriverLicense(driver, token) {
  try {
    const response = await axios.post(
      'https://api-monitoring-and-purchasing-platform-df9e.onrender.com/proxy/6864c95bcf7c6ae928c398c9',
      {
        drivingLicenceNumber: driver.licenseNo,
        userId: driver.email // or whatever userId you want to use
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'vHjOOKz70O3L8mmcVAQDc3EqqxfRRWOgamUSCnN1',
          'Authorization': token
        }
      }
    );
    console.log(`Checked license for ${driver.licenseNo}:`, response.data);
    return response.data;
  } catch (err) {
    console.error(`Error checking license for ${driver.licenseNo}:`, err.response?.data || err.message);
    return null;
  }
}

module.exports = { getAuthToken, checkDriverLicense }; 