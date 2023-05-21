const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k7kswnt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

const toyCollections = client.db("toyDB").collection("toys");


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
    newToy.createdAt = new Date()
    console.log(newToy);
    const result = await toyCollections.insertOne(newToy);
    res.send(result);

})


// my toys by email
app.get("/my-toys/:email", async (req, res) => {

    const result = await toyCollections.find({ sellerEmail: req.params.email }).sort({ createdAt: -1 }).toArray();
    res.send(result);
});


// get data by subcategory
app.get("/toys/:subCat", async (req, res) => {

    // console.log(req.params.subCat);
    const result = await toyCollections.find({
        subCategory: req.params.subCat
    }).sort({ createdAt: -1 }).limit(3).toArray();
    res.send(result);
});

app.get("/toy/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await toyCollections.findOne(query);
    res.send(result);
})


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
})

// Delete toy
app.delete("/toy/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const query = { _id: new ObjectId(id) };
    const result = await toyCollections.deleteOne(query);
    res.send(result);
})



app.listen(port, () => {
    console.log("PixiePlay server is listening on port " + port);
})