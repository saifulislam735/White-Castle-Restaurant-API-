require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
// const db = require('./temp.json')

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6obomcw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {

    try {
        await client.connect();
        const database = client.db("whitecastleDB");
        const menuCollection = database.collection("menuCollection");
        const cartCollection = database.collection("cartCollection");

        app.get('/menu', async (req, res) => {
            try {
                const menuItems = await menuCollection.find().toArray();
                res.send(menuItems);
            } catch (error) {
                console.error('Error fetching menu:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            // console.log(email)
            if (!email) {
                return res.send([])
            }
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/carts', async (req, res) => {
            const carts = req.body;
            console.log(carts)
            const result = await cartCollection.insertOne(carts);
            res.send(result)
        })

        app.delete('/carts/:id', async (req, res) => {
            const itemsId = req.params.id;
            // console.log(itemsId)
            const query = { _id: new ObjectId(itemsId) };
            const result = await cartCollection.deleteOne(query);
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});


