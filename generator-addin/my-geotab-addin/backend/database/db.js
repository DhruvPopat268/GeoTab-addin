const mongoose = require('mongoose');

function ConnectToMongoDb () {
    mongoose.connect(process.env.DB_CONNECT)
    .then( () => { 
        console.log("MongoDb connected successfully")
     } ) 
     .catch((error)=> {
        console.log(error)
     })
}

module.exports = ConnectToMongoDb;