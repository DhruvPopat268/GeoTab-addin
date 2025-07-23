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
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('\n⏰ Cron job started at:', new Date().toISOString());

    const token = await getAuthToken();
    console.log('🔐 Token fetched successfully.');

    const allDriverDocs = await Driver.find();
    if (!allDriverDocs.length) {
      console.log('⚠️ No driver documents found.');
      return;
    }

    const now = new Date();

    for (const doc of allDriverDocs) {
      console.log(`\n📄 Processing document for userId: ${doc.userId} (MongoID: ${doc._id})`);

      const { drivers = [] } = doc;

      if (!drivers.length) {
        console.log(`⚠️ No drivers in userId: ${doc.userId}`);
        continue;
      }

      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i];

        if (!driver.isActive) {
          console.log(`🚫 Skipping inactive driver: ${driver.licenseNumber}`);
          continue;
        }

        const interval = driver.lcCheckInterval || 0;
        const lastChecked = driver.lastCheckedAt ? new Date(driver.lastCheckedAt) : null;
        let shouldCheck = false;

        if (!lastChecked || ((now - lastChecked) / (1000 * 60 * 60 * 24)) >= interval
        ) {
          shouldCheck = true;
        }

        const userId = doc.userId;

        if (shouldCheck) {
          console.log(`🔄 Hitting API for userId: ${doc.userId}, licenseNumber: ${driver.licenseNumber}`);

          await checkDriverLicense(
            {
              licenseNo: driver.licenseNumber,
              userId: userId
            },
            token
          );

          // Update just this driver's lastCheckedAt
          await Driver.updateOne(
            { _id: doc._id, "drivers.licenseNumber": driver.licenseNumber },
            {
              $set: {
                "drivers.$.lastCheckedAt": now,
                updatedAt: now
              }
            }
          );

          console.log(`✅ Updated lastCheckedAt for licenseNumber: ${driver.licenseNumber}`);
        } else {
          console.log(`⏩ Skipped licenseNumber: ${driver.licenseNumber} (interval: ${interval} min, lastCheckedAt: ${lastChecked?.toISOString() || 'Never'})`);
        }
      }
    }

    console.log('\n✅ Cron job completed at:', now.toISOString());
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
});

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});