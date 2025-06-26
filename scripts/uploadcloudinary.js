const { MongoClient } = require('mongodb');
     const cloudinary = require('cloudinary').v2;
     const fs = require('fs');

     // Configure Cloudinary
     cloudinary.config({
       cloud_name: 'drz16ujly',
       api_key: '996653831965414',
       api_secret: 'hAMJTWZPD9Qorq25K-iQQGX4NJo'
     });

     const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster';
     const dbName = 'dotbot';
     const imagesDir = 'C:/Users/home/OneDrive/Desktop/DOTBot/data/standards/';

     async function uploadAllToCloudinary() {
       const client = new MongoClient(uri);
       try {
         await client.connect();
         const db = client.db(dbName);
         const collection = db.collection('construction_standards');

         const standards = await collection.find().toArray();
         console.log(`Found ${standards.length} standards to process`);

         for (const standard of standards) {
           const standardId = standard.standard_id;
           const imagePath = `${imagesDir}${standardId}.jpg`;

           if (!fs.existsSync(imagePath)) {
             console.warn(`Image not found for standard_id ${standardId}: ${imagePath}`);
             continue;
           }

           const result = await cloudinary.uploader.upload(imagePath, {
             public_id: standardId,
             overwrite: true
           });

           const imageUrl = result.secure_url;

           await collection.updateOne(
             { standard_id: standardId },
             { $set: { image_url: imageUrl }, $unset: { filename: '', gridfs_file_id: '' } }
           );
           console.log(`Uploaded ${standardId}.jpg to Cloudinary, URL: ${imageUrl}`);
         }

         console.log('All images uploaded to Cloudinary and URLs updated in MongoDB');
       } catch (err) {
         console.error('Error:', err);
       } finally {
         await client.close();
       }
     }

     uploadAllToCloudinary();