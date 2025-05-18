export default {
  dbURL: process.env.MONGO_URL || 'mongodb+srv://TomShahar:Ts0268420@cluster0.v43k6ve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  dbName : process.env.DB_NAME || 'tester_db'
}
