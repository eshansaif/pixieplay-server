const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k7kswnt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const toyCollections = client.db("toyDB").collection("toys");

    // home route for testing
    app.get("/", (req, res) => {
      res.send("Welcome to the Server");
    });

    // Get toy by descending order and 20 limit
    app.get("/toys", async (req, res) => {
      const cursor = toyCollections.find().sort({ createdAt: -1 });
      const results = await cursor.toArray();
      res.send(results);
    });

    // All toys
    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      newToy.createdAt = new Date();
      console.log(newToy);
      const result = await toyCollections.insertOne(newToy);
      res.send(result);
    });

    // my toys by email
    app.get("/my-toys/:email", async (req, res) => {
      const result = await toyCollections
        .find({ sellerEmail: req.params.email })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // get data by subcategory
    app.get("/toys/:subCat", async (req, res) => {
      const result = await toyCollections
        .find({
          subCategory: req.params.subCat,
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray();
      res.send(result);
    });

    // ... (Define other routes similarly)

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}/`);
    });
  } finally {
    // No need to close the client here, let it be closed when the server is stopped
  }
}

run().catch(console.dir);
