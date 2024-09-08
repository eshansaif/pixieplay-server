const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
// app.use(cors({ origin: "*" }));
app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-firebase-app.web.app"],
  })
);
app.use(express.json());

// const uri = `mongodb+srv://toyAdmin:toyAdmin123@cluster0.k7kswnt.mongodb.net/?retryWrites=true&w=majority`;
const uri = process.env.DB_URL;
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

    // Get toy by  descending order and 20 limit
    app.get("/toys", async (req, res) => {
      // const limit = parseInt(req.query.limit) || 20;
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
      // console.log(req.params.subCat);
      const result = await toyCollections
        .find({
          subCategory: req.params.subCat,
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray();
      res.send(result);
    });
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollections.findOne(query);
      res.send(result);
    });
    // update toy
    app.put("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          subCategory: updatedToy.subCategory,
          toyName: updatedToy.toyName,
          pictureURL: updatedToy.pictureURL,
          sellerName: updatedToy.sellerName,
          sellerEmail: updatedToy.sellerEmail,
          price: updatedToy.price,
          rating: updatedToy.rating,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
      const result = await toyCollections.updateOne(filter, toy, options);
      res.send(result);
    });
    // Delete toy
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toyCollections.deleteOne(query);
      res.send(result);
    });
    // Get toys by ascending or descending order of price
    app.get("/sortedToys", async (req, res) => {
      const { order } = req.query;
      const sortOrder = order === "desc" ? -1 : 1;
      const cursor = toyCollections.find().sort({ price: sortOrder });
      const results = await cursor.toArray();
      res.send(results);
    });
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}/`);
    });
  } finally {
    // No need to close the client here, let it be closed when the server is stopped
  }
}

run().catch(console.dir);
