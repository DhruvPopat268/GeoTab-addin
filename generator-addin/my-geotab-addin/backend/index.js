const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 7000;
const connectToDb = require('./database/db');
const driverRoutes = require('./Routes/driverRoute');

connectToDb();

<<<<<<< HEAD

// Enhanced CORS configuration


app.use(cors({
  origin: [
    'https://my.geotab.com',
    "http://localhost:3000",
    "https://geotab-addin-frontend.onrender.com"
  ],  // Allow MyGeotab domain to access your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
  allowedHeaders: ['Content-Type'],  // Allowed headers
}));
=======
// // 🔥 Put CORS before anything else
// app.use(cors({
//     origin:"*"
// }));

app.options('*', cors());  // Enable pre-flight for all routes

>>>>>>> ad2169eb011dee5f10b903562de379e25612e9da

// Explicit OPTIONS handler for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/driver', driverRoutes);

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});