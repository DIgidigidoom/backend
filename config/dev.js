import dotenv from 'dotenv';
dotenv.config();

export default {
  dbURL: process.env.MONGO_URI,
  dbName: process.env.DB_NAME
}

