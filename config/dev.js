import dotenv from 'dotenv';
dotenv.config();

export default {
  // dbURL: process.env.MONGO_URI,
  dbURL: 'mongodb://127.0.0.1:27017',
  dbName: process.env.DB_NAME
}

