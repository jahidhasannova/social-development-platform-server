
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

let db;

const connectDB = async () => {
  await client.connect();
  db = client.db("kindora");
  console.log("MongoDB connected successfully!");
};

const getDB = () => db;

module.exports = { connectDB, getDB };
