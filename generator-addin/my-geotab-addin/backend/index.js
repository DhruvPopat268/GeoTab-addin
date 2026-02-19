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
const bodyParser = require("body-parser");

connectToDb();

app.use(cors({
  origin: [
    "https://driver-consent-form.vercel.app/",
    "https://driver-consent-form.vercel.app",
    'http://localhost:5173',
    'https://my.geotab.com',
    "http://localhost:3000",
    "https://geotab-addin-frontend.onrender.com",
    "https://mygeotab-addin-frontend.onrender.com/PTCAddIn.html",
    "https://c4u-online.co.uk/add-api/get-driver-details.php",
    "https://geotab-addin-backend-hlji.onrender.com"
  ],  // Allow MyGeotab domain to access your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // Allowed methods
  allowedHeaders: ['Content-Type'],  // Allowed headers
}));

// Explicit OPTIONS handler for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10mb" }));

app.use('/api/driver', driverRoute)
app.use('/api/driverData', driverDataRoute)
app.use('/api/UserWallet', UserWallet)
app.use('/api/DriverConsent', DriverConsent)

// Cron job: every 1 minute (for per-driver interval logic)
// cron.schedule('* * * * *', async () => {
//   try {
//     console.log('\n⏰ Cron job started at:', new Date().toISOString());

//     const token = await getAuthToken();
//     console.log('🔐 Token fetched successfully.');

//     const allDriverDocs = await Driver.find();
//     if (!allDriverDocs.length) {
//       console.log('⚠️ No driver documents found.');
//       return;
//     }

//     for (const doc of allDriverDocs) {
//       console.log(`\n📄 Processing userId: ${doc.userId} (MongoID: ${doc._id})`);
//       const { drivers = [] } = doc;

//       if (!drivers.length) {
//         console.log(`⚠️ No drivers found for userId: ${doc.userId}`);
//         continue;
//       }

//       for (let i = 0; i < drivers.length; i++) {
//         const driver = drivers[i];

//         if (!driver.isActive) {
//           console.log(`🚫 Skipping inactive driver: ${driver.licenseNumber}`);
//           continue;
//         }

//         const normalizedLicense = driver.licenseNumber?.trim();
//         const interval = driver.lcCheckInterval || 0; // in minutes
//         const lastChecked = driver.lastCheckedAt ? new Date(driver.lastCheckedAt) : null;

//         let shouldCheck = false;

//         if (!lastChecked) {
//           console.log(`📅 No lastCheckedAt for ${normalizedLicense} — will run check.`);
//           shouldCheck = true;
//         } else {
//           const minutesSinceLastCheck = (Date.now() - lastChecked.getTime()) / (1000 * 60);
//           if (minutesSinceLastCheck >= interval) {
//             console.log(`📈 ${normalizedLicense} checked ${minutesSinceLastCheck.toFixed(1)} mins ago (interval: ${interval} mins)`);
//             shouldCheck = true;
//           }
//         }

//         if (shouldCheck) {
//           console.log(`🔄 Hitting API for userId: ${doc.userId}, licenseNumber: ${normalizedLicense}`);

//           const apiResult = await checkDriverLicense(
//             {
//               licenseNo: normalizedLicense,
//               userId: doc.userId
//             },
//             token
//           );

//           // Only update if check was successful
//           if (apiResult?.status === true) {
//             const updatedAt = new Date();

//             const updateResult = await Driver.updateOne(
//               { _id: doc._id, "drivers.licenseNumber": normalizedLicense },
//               {
//                 $set: {
//                   "drivers.$.lastCheckedAt": updatedAt,
//                   updatedAt: updatedAt
//                 }
//               }
//             );

//             if (updateResult.matchedCount === 0) {
//               console.warn(`❌ Failed to match driver for update: ${normalizedLicense}`);
//               console.log('📋 All licenseNumbers in this doc:', doc.drivers.map(d => d.licenseNumber));
//             } else {
//               console.log(`✅ Updated lastCheckedAt for ${normalizedLicense}. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);
//             }
//           } else {
//             console.error(`❌ Error checking license for ${normalizedLicense}:`, apiResult);
//           }
//         } else {
//           console.log(`⏩ Skipped ${normalizedLicense} (interval: ${interval} mins, lastCheckedAt: ${lastChecked?.toISOString() || 'Never'})`);
//         }
//       }
//     }

//     console.log('\n✅ Cron job completed at:', new Date().toISOString());
//   } catch (err) {
//     console.error('❌ Cron job error:', err);
//   }
// });

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});