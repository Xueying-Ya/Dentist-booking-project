const mongoose = require('mongoose');

const connectDB = async ()=> {
    mongoose.set('strictQuery',true);
    const conn = await mongoose.connect(process.env.MONGO_URI,{
        dbName: 'dental_database'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

}

module.exports = connectDB;