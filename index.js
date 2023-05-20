const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

app.get('/', (req, res) => {
    res.send("PixiePlay server is running")
})


app.get("/toys", async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const cursor = toyCollections.find().limit(limit);
    const results = await cursor.toArray();
    res.send(results);
})


app.post("/toys", async (req, res) => {
    const newToy = req.body;
    console.log(newToy);
    const result = await toyCollections.insertOne(newToy);
    res.send(result);

})



app.listen(port, () => {
    console.log("PixiePlay server is listening on port " + port);
})