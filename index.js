import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import "dotenv/config";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
const PORT = 5000;

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

app.use(cors());
app.use(express.json());

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("WanderLust");
const destinationCollection = db.collection("destination");
const bookingCollection = db.collection("Bookings");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }

  try {
    const JWKS = createRemoteJWKSet(
      new URL("/api/auth/jwks", process.env.CLIENT_URL)
    );

    const { payload } = await jwtVerify(token, JWKS);

    req.user = payload;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).send({ msg: "Invalid token!" });
  }
};

app.post("/add-destination", verifyToken, async (req, res) => {
  const data = req.body;
  const result = await destinationCollection.insertOne(data);
  res.send(result);
});

app.get("/destinations", async (req, res) => {
  const result = await destinationCollection.find().toArray();
  res.send(result);
});

app.get('/featured-destinations', async(req, res) => {
  const result  = await destinationCollection.find().limit(5).toArray()
  res.send(result)
})

app.get("/destination/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await destinationCollection.findOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});

app.patch("/destination/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const result = await destinationCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data },
  );
  res.json(result);
});

app.delete("/destination/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await destinationCollection.deleteOne({
    _id: new ObjectId(id),
  });
  res.json(result);
});

app.post("/booking", async (req, res) => {
  const data = req.body;
  const result = await bookingCollection.insertOne(data);
  res.send(result);
});

app.get("/my-bookings/:email", verifyToken, async (req, res) => {
  const { email } = req.params;
  const result = await bookingCollection.find({ email: email }).toArray();
  res.send(result);
});

app.delete("/my-bookings/:id", async (req, res) => {
  const { id } = req.params;
  const result = await bookingCollection.deleteOne({ _id: id });
  res.send(result);
});

//http://localhost:5000

app.get("/", (req, res) => {
  res.send({ message: "Server is running fine!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

export default app