const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB connection details
const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster'; // Update with your MongoDB URI if different
const dbName = 'dotbot';
const collectionName = 'vendor_directory';

// Connect to MongoDB
const filePath = 'vendors.json';
let vendorsData;
try {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  vendorsData = JSON.parse(rawData);
  console.log('JSON file read successfully. Total vendors:', vendorsData.length);
} catch (error) {
  console.error('Error reading JSON file:', error.message);
  process.exit(1);
}

// Connect to MongoDB
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert vendors data
    const result = await collection.insertMany(vendorsData);
    console.log(`Inserted ${result.insertedCount} vendors into ${collectionName}`);

  } catch (error) {
    console.error('Error inserting data into MongoDB:', error.message);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

run().catch(console.dir);