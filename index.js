const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json());

// assignment-11
// SFEOKrp0mCb0Q09x

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k7j1why.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
        // database collection
        const feature = client.db('assignment-11').collection('assignment-11-room')
        const bookedRoomsCollection = client.db('assignment-11').collection('booked-rooms')
        const Reviews = client.db('assignment-11').collection('Reviews')
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // feature section 6 card data
        app.get('/feature', async (req, res) => {
            const cursor = feature.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/mybooking', async (req, res) => {
            // console.log(req.query.email)
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookedRoomsCollection.find(query).toArray();
            res.send(result)
        })
        // feature details get only id match data
        app.get('/featureDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await feature.findOne(query);
            res.send(result)

        })
        // post bookded data
        app.post('/bookedRoom', async (req, res) => {
            const bookdedData = req.body;
            const id = bookdedData._id;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const change = {
                $set: {
                    availability: bookdedData.availability
                }
            }
            const update = await feature.updateOne(query, change)
            const result = await bookedRoomsCollection.insertOne(bookdedData);
            res.send(result);
        })
        app.get('/', (req, res) => {
            res.send('assignment-11 server is running')
        })

        // delete
        app.delete('/cancellation/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id }
            const newquery = { _id: new ObjectId(id) }
            const change = {
                $set: {
                    availability: 'Available'
                }
            }
            const update = await feature.updateOne(newquery, change)
            const result = await bookedRoomsCollection.deleteOne(query);
            res.send(result);
        })
        // post reviews 
        app.post('/addReview', async (req, res) => {
            const reviewData = req.body;
            const result = await Reviews.insertOne(reviewData);
            res.send(result);
        })
        //   get reviews
        app.get('/reviewData', async (req, res) => {
            try {
                const cursor = Reviews.find().sort({ date: -1, star: 1 });
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`assignment 11 running on:${port}`)
})

