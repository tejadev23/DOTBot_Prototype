const { MongoClient } = require('mongodb');
     const fs = require('fs').promises;

     const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster'; // Replace with your MongoDB connection string
     const dbName = 'dotbot'; // Replace with your database name
     const jsonFilePath = 'C:/Users/home/OneDrive/Desktop/DOTBot-Prototype/dotbot-auth/cleaned_standards_for_mongo.json'; // Path to your JSON file

     async function uploadJsonToMongo() {
       const client = new MongoClient(uri);
       try {
         await client.connect();
         const db = client.db(dbName);
         const collection = db.collection('construction_standards');

         // Clear existing documents in the collection
         const deleteResult = await collection.deleteMany({});
         console.log(`Deleted ${deleteResult.deletedCount} documents from construction_standards`);

         // Read JSON file
         const jsonData = JSON.parse(await fs.readFile(jsonFilePath, 'utf8'));

         // Insert JSON data into collection
         const insertResult = await collection.insertMany(jsonData);
         console.log(`Successfully uploaded ${insertResult.insertedCount} documents to construction_standards`);

         // Verify by counting documents
         const count = await collection.countDocuments();
         console.log(`Total documents in construction_standards: ${count}`);

         // Optional: Print a sample document to verify
         const sample = await collection.findOne();
         console.log('Sample document:', sample);
       } catch (err) {
         console.error('Error:', err);
       } finally {
         await client.close();
       }
     }

     uploadJsonToMongo();