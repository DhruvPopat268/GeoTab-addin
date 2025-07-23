const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 7000;
const connectToDb = require('./database/db');
const driverRoute = require('./routes/driverRoute')
const driverDataRoute = require('./routes/driverDataRoute')
const UserWallet = require('./routes/UserWallet')
const DriverConsent = require('./routes/DriverConsent')
const Driver = require('./models/driverModel'); // Added for cron job
const { getAuthToken, checkDriverLicense } = require('./utils/licenseCheck'); // Added for cron job
const cron = require('node-cron'); // Added for cron job

connectToDb();

app.use(cors({
  origin: [
    'https://my.geotab.com',
    "http://localhost:3000",
    "https://geotab-addin-frontend.onrender.com",
    "https://mygeotab-addin-frontend.onrender.com/prayoshaAddIn.html",
    "https://c4u-online.co.uk/add-api/get-driver-details.php",
    "https://geotab-addin-backend-hlji.onrender.com"
  ],  // Allow MyGeotab domain to access your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // Allowed methods
  allowedHeaders: ['Content-Type'],  // Allowed headers
}));

// Explicit OPTIONS handler for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/driver', driverRoute)
app.use('/api/driverData', driverDataRoute)
app.use('/api/UserWallet', UserWallet)
app.use('/api/DriverConsent', DriverConsent)

// Cron job: every 1 minute (for per-driver interval logic)
// cron.schedule('*/1 * * * *', async () => {
//   try {
//     console.log('--- Cron job started: Checking driver licenses (per-driver interval) ---');
//     const token = await getAuthToken();
//     const drivers = await Driver.find({ isActive: true }); // Only active drivers
//     const now = new Date();
//     if (!drivers.length) {
//       console.log('No active drivers found for license check.');
//     }
//     for (const driver of drivers) {
//       const interval = driver.lcCheckInterval ; // in minutes
//       const lastChecked = driver.lastCheckedAt ? new Date(driver.lastCheckedAt) : null;
//       let shouldCheck = false;
//       if (!lastChecked) {
//         shouldCheck = true;
//       } else {
//         const diffMs = now - lastChecked;
//         const diffMin = diffMs / (1000 * 60);
//         if (diffMin >= interval) {
//           shouldCheck = true;
//         }
//       }
//       if (shouldCheck) {
//         console.log(`API hit for licenseNo: ${driver.licenseNo} (interval: ${interval} min)`);
//         await checkDriverLicense(driver, token);
//         // Update lastCheckedAt
//         await Driver.updateOne({ _id: driver._id }, { $set: { lastCheckedAt: now } });
//       } else {
//         console.log(`Skipped licenseNo: ${driver.licenseNo} (interval: ${interval} min, last checked: ${lastChecked})`);
//       }
//     }
//     console.log('--- License check completed for all drivers at', now, '---');
//   } catch (err) {
//     console.error('Cron job error:', err);
//   }
// });

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});