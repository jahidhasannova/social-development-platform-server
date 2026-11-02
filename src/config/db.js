
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

let db;

const connectDB = async () => {
  await client.connect();

  db = client.db("kindora");

  await db.collection("eventParticipants").createIndex(
    {
      eventId: 1,
      userEmail: 1,
    },
    {
      unique: true,
    }
  );

  console.log("MongoDB connected successfully!");
};

const getDB = () => db;

module.exports = { connectDB, getDB };
