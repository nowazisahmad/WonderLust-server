import express from "express";
import { MongoClient } from 'mongodb';
import cors from "cors";
import 'dotenv/config';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
};

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("WonderLust");
const destinationCollection = db.collection("destination");

app.post("/add-destination", async(req, res) => {
  const data = req.body
  const result = await destinationCollection.insertOne(data);
  console.log(result);
  res.send({message: "Api is running..."})
});

// http://localhost:5000

app.get("/", (req, res) => {
    res.send({message: "Srever is running"})
});

app.listen(PORT, ()  => {
    console.log(`Server is running at ${PORT}`);
});