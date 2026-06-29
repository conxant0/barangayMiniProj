const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);
const dbname = "barangay";

const connectToDB = async () => {
  try {
    await client.connect();
    console.log(`Connected to ${dbname}`);

    return client.db(dbname);
  } catch (error) {
    console.log(`Error connecting to DB ${error}`);
  }
};

module.exports = { connectToDB, client };
