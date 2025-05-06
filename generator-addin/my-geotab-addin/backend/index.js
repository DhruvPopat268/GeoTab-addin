const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 7000;
const connectToDb = require('./database/db');
const driverRoutes = require('./Routes/driverRoute');

connectToDb();

// Allowed origins - replace with your actual domains
const allowedOrigins = [
  'https://geotab-addin-frontend.onrender.com', // Your frontend
  'https://my.geotab.com', // MyGeoTab
  'https://my.geotab.com.au',
  'https://my.geotab.ca',
  'https://my.geotab.eu',
  'http://localhost:3000' // For local development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || 
        origin.endsWith('.geotab.com')) { // Allow all geotab subdomains
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', ],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'] // Important for credentials
}));

// Handle preflight requests


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/driver', driverRoutes);

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});