const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRETE)
const app = express();
const port = process.env.PORT || 5000;

// middlewire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.smfjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// // function

async function run(){

	try{
		await client.connect();
		console.log('connected')

		const database = client.db("pipi");
		const itemsCollection = database.collection('items');
		const usersCollection = database.collection('users');
		const reviewsCollection = database.collection('reviews');
		const ordersCollection = database.collection('orders');


		// app.post('products')

		

		// post api
		app.post('/items', async(req, res) =>{
			const item = req.body;
			const result = await productsCollection.insertOne(item);
			res.json(result);
		})

		// post api(review)
		app.post('/reviews', async(req, res) =>{
			const review = req.body;
			const result = await reviewsCollection.insertOne(review);
			res.json(result);
		})

		// post api(orders)

		app.post('/orders', async(req, res) =>{
			const order = req.body;
			const result = await ordersCollection.insertOne(order);
			res.json(result);
		})


		// users collection

		app.post('/users', async(req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			console.log(result)
			res.json(result);
		})

		// payment

		app.post('/create-payment-intent', async (req, res) => {
			const paymentInfo = req.body;
			const amount = paymentInfo.price * 100;
			const paymentIntent = await stripe.paymentIntents.create({
				currency: 'usd',
				amount: amount,
				payment_method_types: ['card']
			});
			res.json({ clientSecret: paymentIntent.client_secret})
		})

		// get items
		app.get('/items', async(req, res) =>{
			const cursor = itemsCollection.find({});
			const products = await cursor.toArray();
			res.send(products);
		})

		// get users 

		app.get('/users', async(req, res) =>{
			const cursor = usersCollection.find({});
			const users = await cursor.toArray();
			res.send(users);
		})

		// get order pay
		app.get('/orders/:id', async(req, res) =>{
			const id = req.params.id;
			console.log(id);
			const query = {_id: ObjectId(id)};
			const items = await ordersCollection.findOne(query);
			res.json(items);
		})

		app.get('/reviews', async(req, res) =>{
			const cursor = reviewsCollection.find({});
			const review = await cursor.toArray();
			res.send(review);
		})

		// get orders
		app.get('/orders', async(req, res) =>{
			const cursor = ordersCollection.find({});
			const order = await cursor.toArray();
			res.send(order);
		})

		app.get('/dashusers', async(req, res) =>{			
			const email = req.query.email;
			const query = {email:email}
			const cursor = usersCollection.find(query);
			const user = await cursor.toArray();
			res.send(user);
		})



		app.get('/reviews', async(req, res) =>{
			const email = req.query.email;
			const query = {email:email}
			const cursor = reviewsCollection.find(query);
			const review = await cursor.toArray();
			res.send(review);
		})
		
		app.get('/myOrders', async(req, res) =>{			
			const email = req.query.email;
			const query = {email:email}
			const cursor = ordersCollection.find(query);
			const order = await cursor.toArray();
			res.send(order);
		})

// 		// getting single items
		app.get('/items/:id', async(req, res) =>{
			const id = req.params.id;
			console.log(id);
			const query = {_id: ObjectId(id)};
			const items = await itemsCollection.findOne(query);
			res.json(items);
		})

		app.get('/users/:email', async(req, res) =>{
			const email = req.params.email;
			// console.log(id);
			const query = {email: email};
			const user = await usersCollection.findOne(query);
			// res.json(products);
			let isAdmin = false;

			if(user?.role === 'admin'){
				isAdmin= true;
			}
			res.json({admin:isAdmin});
		})



		app.put('/users/admin', async(req, res) => {
			const user = req.body;
			const filter = {email: user.email};
			// const options = {upsert: true};
			const updateDoc = {$set:{role:"admin"}};
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.json(result);
		})


		app.put('/users', async(req, res) => {
			const user = req.body;
			const filter = {email: user.email};
			const options = {upsert: true};
			const updateDoc = {$set:user};
			const result = await usersCollection.updateOne(filter, updateDoc, options);
			res.json(result);
		})


		/*
			delete
		*/

		app.delete('/orders/:id', async(req, res) =>{
			const id = req.params.id;
			console.log('id',id)
			const query = {_id: ObjectId(id)};
			const result = await ordersCollection.deleteOne(query);
			res.json(result);
		})
}

finally{
		// await client.close();
	}

}

run().catch(console.dir);


app.get('/', (req, res) => {
	res.send('Running Pipi website server');
});

app.listen(port, () =>{
	console.log('Running Pipi Server on port', port);
})