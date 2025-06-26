const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster'; // Replace with your MongoDB connection string
const dbName = 'dotbot'; // Replace with your database name

async function connectToMongo() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    const db = client.db(dbName);
    // Test by listing collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    await client.close();
  }
}

connectToMongo();