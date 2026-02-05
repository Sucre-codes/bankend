const mongoose = require('mongoose');
const { env } = require('./env');

const connectDb = async () => {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('mongodb connected')
    }catch (error) {
    console.log('mongodb connection error',error)
  }
}
module.exports = { connectDb };