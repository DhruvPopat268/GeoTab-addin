const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 7000;
const connectToDb = require('./database/db');
const driverRoute = require('./routes/driverRoute')
const driverDataRoute = require('./routes/driverDataRoute')

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
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
  allowedHeaders: ['Content-Type'],  // Allowed headers
}));

// Explicit OPTIONS handler for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/driver', driverRoute)
app.use('/api/driverData', driverDataRoute)

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});