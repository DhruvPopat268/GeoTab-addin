const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 7000
const connectToDb = require('./database/db')
const driverRoutes = require('./Routes/driverRoute')

connectToDb();

app.use(cors({
    origin:'http://localhost:3000'
}))

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use('/driver', driverRoutes)

app.listen(port,()=>{
    console.log(`server started at ${port}`)
})