const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;




