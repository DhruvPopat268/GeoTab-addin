const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 7000
const connectToDb = require('./database/db')
const driverRoutes = require('./Routes/driverRoute')

connectToDb();

const allowedOrigins = [
    'https://geotab-addin-frontend.onrender.com', // Your frontend
    'https://my.geotab.com', // Production MyGeoTab
    'https://my.geotab.com.au',
    'https://my.geotab.ca',
    'https://my.geotab.eu'
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use('/driver', driverRoutes)

app.listen(port,()=>{
    console.log(`server started at ${port}`)
})