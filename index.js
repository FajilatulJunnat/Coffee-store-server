const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express()
const port=process.env.PORT || 5000;
// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.uwiau.mongodb.net:27017,cluster0-shard-00-01.uwiau.mongodb.net:27017,cluster0-shard-00-02.uwiau.mongodb.net:27017/?ssl=true&replicaSet=atlas-9xpxm6-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;



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

    // add database
    const coffeeCollection=client.db('coffeeDB').collection('coffee')
    const usersCollection=client.db('coffeeDB').collection('users')

    // read
    app.get("/coffee",async(req,res)=>{
      const cursor=coffeeCollection.find()
      const result=await cursor.toArray()
      res.send(result)
    })
    // update
    app.get("/coffee/:id",async(req,res)=>{
      const id=req.params.id
      const query={_id :new ObjectId(id)}
      const result= await coffeeCollection.findOne(query)
      res.send(result)
    })
    // create
    app.post("/coffee",async(req,res)=>{
      const newCoffee=req.body
      console.log(newCoffee);
      const result=await coffeeCollection.insertOne(newCoffee)
      res.send(result)
      
    })
    // update
    app.put("/coffee/:id",async (req,res)=>{
      const id=req.params.id
      const query={_id :new ObjectId(id)}
      const options={upsert:true}
      const updatedCoffee=req.body
      const coffee={
        $set:{
          name:updatedCoffee.name,
          quantity:updatedCoffee.quantity,
          supplier:updatedCoffee.supplier,
          taste:updatedCoffee.taste,
          category:updatedCoffee.category,
          details:updatedCoffee.details,
          photo:updatedCoffee.photo
        }
      }
      const result=await coffeeCollection.updateOne(query,coffee,options)
      res.send(result)
    })
    // delete
    app.delete("/coffee/:id",async(req,res)=>{
      const id=req.params.id
      const query={_id : new ObjectId(id)}
      const result=await coffeeCollection.deleteOne(query)
      res.send(result)
    })

    // Users related Api
    app.get('/users',async(req,res)=>{
      const cursor=usersCollection.find()
      const result=await cursor.toArray()
      res.send(result)
    })
    app.post("/users",async(req,res)=>{
      const newUser=req.body
      console.log("creating new users",newUser);
      const result=await usersCollection.insertOne(newUser)
      res.send(result)
    })
    app.patch("/users",async(req,res)=>{
      const email=req.body.email
      const query={email}
      const updatedUserInfo={
        $set:{
          lastSignInTime:req.body?.lastSignInTime
        }
      }
      const result=await usersCollection.updateOne(query,updatedUserInfo)
      res.send(result)
    })
    app.delete("/users/:id",async (req,res)=>{
      const id=req.params.id
      const query={_id: new ObjectId(id)}
      const result=await usersCollection.deleteOne(query)
      res.send(result)
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


app.get("/",(req,res)=>{
    res.send('coffee making server is running')
})
app.listen(port,()=>{
    console.log(`coffee server is running on :${port}`);
    
})