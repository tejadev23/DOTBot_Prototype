const { MongoClient } = require('mongodb');
const fs = require('fs');

// Connection URL (update with your MongoDB URI if different)
const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster';
const dbName = 'dotbot';
const collectionName = 'spec_chunks';

// Load the embedded chunks
const embeddedChunks = JSON.parse(fs.readFileSync('spec_chunks.json', 'utf8'));

async function storeData() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert the data
    const result = await collection.insertMany(embeddedChunks);
    console.log(`Inserted ${result.insertedCount} documents into ${collectionName}`);
  } catch (error) {
    console.error('Error storing data:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

storeData().catch(console.dir);