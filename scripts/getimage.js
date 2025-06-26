const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();

const uri = 'mongodb+srv://vishnu23ai:cM1pyTMjulNyDKqI@dotbot-cluster.grahhbu.mongodb.net/?retryWrites=true&w=majority&appName=dotbot-cluster';
const dbName = 'dotbot';

app.get('/chart/:standardId', async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('construction_standards');

    const chart = await collection.findOne({ standard_id: req.params.standardId });
    await client.close();

    if (!chart || !chart.image_url) {
      res.status(404).send('Chart not found');
      return;
    }

    res.redirect(chart.image_url); // Redirect to the Cloudinary URL
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
});

const port = 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));