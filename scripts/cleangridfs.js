const { MongoClient } = require('mongodb');

     const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster';
     const dbName = 'dotbot';

     async function cleanupGridFS() {
       const client = new MongoClient(uri);
       try {
         await client.connect();
         const db = client.db(dbName);
         const collection = db.collection('construction_standards');

         const standards = await collection.find({ gridfs_file_id: { $exists: true } }).toArray();
         console.log(`Found ${standards.length} documents with gridfs_file_id to clean`);

         for (const standard of standards) {
           try {
             // Clear gridfs_file_id (no need to delete from fs.files/chunks since already done)
             await collection.updateOne(
               { _id: standard._id },
               { $unset: { gridfs_file_id: '' } }
             );
             console.log(`Cleared gridfs_file_id for standard_id ${standard.standard_id}`);
           } catch (err) {
             console.error(`Error clearing ${standard.standard_id}:`, err);
             break; // Stop on error to avoid further quota issues
           }
         }

         console.log('GridFS cleanup and document updates completed');
       } catch (err) {
         console.error('Error:', err);
       } finally {
         await client.close();
       }
     }

     cleanupGridFS();