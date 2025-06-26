const { MongoClient, GridFSBucket } = require('mongodb');
     const fs = require('fs'); // Corrected import

     const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster'; // Replace with your MongoDB connection string
     const dbName = 'dotbot'; // Replace with your database name
     const imagePath = 'C:/Users/home/OneDrive/Desktop/DOTBot/data/standards/1001B.jpg'; // Path to your image
     const standardId = '1001B'; // Standard ID for the image

     async function uploadImageToGridFS() {
       const client = new MongoClient(uri);
       try {
         await client.connect();
         const db = client.db(dbName);
         const bucket = new GridFSBucket(db);
         const collection = db.collection('construction_standards');

         // Upload image to GridFS
         const readStream = fs.createReadStream(imagePath); // Updated to use fs directly
         const uploadStream = bucket.openUploadStream(`${standardId}.jpg`, {
           metadata: { standard_id: standardId }
         });

         readStream.pipe(uploadStream);

         const fileId = await new Promise((resolve, reject) => {
           uploadStream.on('finish', () => resolve(uploadStream.id));
           uploadStream.on('error', reject);
         });

         console.log(`Image uploaded to GridFS with file ID: ${fileId}`);

         // Update the construction_standards document with the GridFS file ID
         const updateResult = await collection.updateOne(
           { standard_id: standardId },
           { $set: { gridfs_file_id: fileId }, $unset: { filename: '' } }
         );

         console.log(`Updated document for standard_id ${standardId}:`, updateResult.modifiedCount, 'document(s) modified');

         // Verify the upload in fs.files
         const fileInfo = await db.collection('fs.files').findOne({ _id: fileId });
         console.log('Uploaded file info:', fileInfo);

         // Optional: Verify the updated document
         const updatedDoc = await collection.findOne({ standard_id: standardId });
         console.log('Updated document:', updatedDoc);
       } catch (err) {
         console.error('Error:', err);
       } finally {
         await client.close();
       }
     }

     uploadImageToGridFS();