require('dotenv').config();
const { URI_DATABASE_MONGODB } = process.env;

const mongoose = require('mongoose');
const connectMongoDB = async () => {
  try {
    await mongoose.connect(URI_DATABASE_MONGODB);
    console.log('CONNECT MONGODB SUCCESSFULLY');
  } catch (error) {
    console.log('ERROR CONNECT MONGODB');
    console.log(error);
  }
};

module.exports = { connectMongoDB };
