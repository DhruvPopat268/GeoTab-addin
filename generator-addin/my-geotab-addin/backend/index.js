const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 7000;
const connectToDb = require('./database/db');
const driverRoutes = require('./Routes/driverRoute');

connectToDb();

// // 🔥 Put CORS before anything else
// app.use(cors({
//     origin:"*"
// }));

app.options('*', cors());  // Enable pre-flight for all routes




// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/driver', driverRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
